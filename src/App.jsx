import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantAuth from "./components/Auth/Auth"; // Đường dẫn dựa trên thư mục đề xuất
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import MenuPage from "./pages/MenuPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<RestaurantAuth />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </Router>
  );
}

export default App;
