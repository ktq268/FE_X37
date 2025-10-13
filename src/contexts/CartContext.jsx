import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Tính tổng số lượng món trong giỏ hàng
  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Load giỏ hàng từ server hoặc localStorage
  const loadCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Đã đăng nhập - load từ server
        const cartData = await getCart(token);
        const items = cartData?.items || [];
        setCartItems(items);
        setTotalItems(calculateTotalItems(items));
      } else {
        // Chưa đăng nhập - load từ localStorage
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const items = localCart.map((item) => ({
          menuItem: item,
          menuItemId: item._id,
          quantity: item.quantity || 1,
        }));
        setCartItems(items);
        setTotalItems(calculateTotalItems(items));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      // Fallback to localStorage
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const items = localCart.map((item) => ({
        menuItem: item,
        menuItemId: item._id,
        quantity: item.quantity || 1,
      }));
      setCartItems(items);
      setTotalItems(calculateTotalItems(items));
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm món vào giỏ hàng
  const addToCart = async (menuItem, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Đã đăng nhập - gọi API
        await addCartItem({ menuItemId: menuItem._id, quantity }, token);
      } else {
        // Chưa đăng nhập - lưu vào localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItemIndex = existingCart.findIndex(
          (item) => item._id === menuItem._id
        );

        if (existingItemIndex >= 0) {
          existingCart[existingItemIndex].quantity =
            (existingCart[existingItemIndex].quantity || 1) + quantity;
        } else {
          existingCart.push({ ...menuItem, quantity });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
      }

      // Reload cart để cập nhật UI
      await loadCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Fallback to localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = existingCart.findIndex(
        (item) => item._id === menuItem._id
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity =
          (existingCart[existingItemIndex].quantity || 1) + quantity;
      } else {
        existingCart.push({ ...menuItem, quantity });
      }

      localStorage.setItem("cart", JSON.stringify(existingCart));
      await loadCart();
    }
  };

  // Cập nhật số lượng món
  const updateItemQuantity = async (menuItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await updateCartItem(menuItemId, { quantity }, token);
      } else {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const itemIndex = existingCart.findIndex(
          (item) => item._id === menuItemId
        );
        if (itemIndex >= 0) {
          existingCart[itemIndex].quantity = quantity;
          localStorage.setItem("cart", JSON.stringify(existingCart));
        }
      }

      await loadCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  // Xóa món khỏi giỏ hàng
  const removeFromCart = async (menuItemId) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await removeCartItem(menuItemId, token);
      } else {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const filteredCart = existingCart.filter(
          (item) => item._id !== menuItemId
        );
        localStorage.setItem("cart", JSON.stringify(filteredCart));
      }

      await loadCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await clearCart(token);
      } else {
        localStorage.removeItem("cart");
      }

      setCartItems([]);
      setTotalItems(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Load cart khi component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Listen for storage changes (để sync giữa các tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    cartItems,
    totalItems,
    isLoading,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCartItems,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
