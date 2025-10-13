import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";
import HomePage from "./pages/HomePage";
import RestaurantAuth from "./components/Auth/Auth"; // Đường dẫn dựa trên thư mục đề xuất
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import StaffPage from "./pages/staffPage.jsx";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

function StaffOnlyRoute({ children }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") || "").toLowerCase()
      : null;
  if (token && !role) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      role = String(payload?.user?.role || payload?.role || "").toLowerCase();
      if (role) localStorage.setItem("role", role);
    } catch {
      void 0;
    }
  }
  if (!token || role !== "staff") {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
``;

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<RestaurantAuth />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route
              path="/staff"
              element={
                <StaffOnlyRoute>
                  <StaffPage />
                </StaffOnlyRoute>
              }
            />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
