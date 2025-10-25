import React from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const CartBadge = ({ className = "" }) => {
  const { totalItems } = useCart();

  return (
    <Link to="/cart" className={`relative hover:text-yellow-200 ${className}`}>
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartBadge;
