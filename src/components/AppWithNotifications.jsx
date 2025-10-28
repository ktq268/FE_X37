import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification.js';
import NotificationProvider from './NotificationProvider.jsx';
import HomePage from '../pages/HomePage';
import RestaurantAuth from './Auth/Auth';
import BookingPage from '../pages/BookingPage';
import BookingSuccess from '../pages/BookingSuccess';
import StaffPage from '../pages/staffPage';
import AdminPage from '../pages/adminPage';
import MenuPage from '../pages/MenuPage';
import CartPage from '../pages/CartPage.jsx';
import StaffOnlyRoute from '../routes/StaffOnlyRoute';
import AdminOnlyRoute from '../routes/AdminOnlyRoute';

import { CartProvider } from "../contexts/CartContext";

const AppContent = () => {
  const notification = useNotification();

  return (
    <CartProvider>
      <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<RestaurantAuth />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-success" element={<BookingSuccess />} />

        {/* Staff only */}
        <Route
          path="/staff"
          element={
            <StaffOnlyRoute>
              <StaffPage />
            </StaffOnlyRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <AdminOnlyRoute>
              <AdminPage />
            </AdminOnlyRoute>
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
      
      <NotificationProvider notifications={notification.notifications} />
    </Router>
    </CartProvider>
  );
};

function App() {
  return <AppContent />;
}

export default App;
