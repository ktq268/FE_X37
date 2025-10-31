import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useCart } from "../contexts/CartContext";
import { createOrderFromCart } from "../api/api";

export default function CartPage() {
  const {
    cartItems,
    isLoading,
    updateItemQuantity,
    removeFromCart,
    clearCartItems,
  } = useCart();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const checkout = async () => {
    if (token) {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) {
        alert("Vui lòng chọn chi nhánh trước khi thanh toán.");
        return;
      }
      await createOrderFromCart({ restaurantId }, token);
      await clearCartItems();
      alert("Đã tạo đơn hàng từ giỏ!");
    } else {
      alert("Vui lòng đăng nhập để đặt hàng.");
    }
  };

  // helpers
  const getItemImage = (m) => {
    return (
      m?.imageUrl ||
      m?.image ||
      m?.thumbnail ||
      (Array.isArray(m?.images) && m.images[0]) ||
      m?.photo ||
      null
    );
  };

  const items = cartItems.map((it) => {
    const m = it.menuItem || it.item || it.product || {};
    const id = it.menuItemId || m._id || it._id;
    const name = m.name || it.name || "";
    const price = m.price ?? it.price ?? 0;
    const quantity = it.quantity || 1;
    const image = getItemImage(m) || it.imageUrl || null;
    return { id, name, price, quantity, image };
  });

  const computedTotal = items.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>
        {isLoading ? (
          <div>Đang tải...</div>
        ) : items.length === 0 ? (
          <div>Giỏ hàng trống.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-white p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-16 bg-gray-200 overflow-hidden">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      {(it.price || 0).toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateItemQuantity(it.id, (it.quantity || 1) - 1)
                      }
                      className="px-2 bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{it.quantity || 1}</span>
                    <button
                      onClick={() =>
                        updateItemQuantity(it.id, (it.quantity || 1) + 1)
                      }
                      className="px-2 bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(it.id)}
                    className="ml-4 text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 h-fit">
              <div className="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span className="font-semibold">
                  {(computedTotal || 0).toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearCartItems}
                  className="flex-1 bg-gray-200 py-2"
                >
                  Xóa hết
                </button>
                <button
                  onClick={checkout}
                  className="flex-1 bg-orange-500 text-white py-2"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
