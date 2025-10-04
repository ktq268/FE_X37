import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantAuth from './components/Auth/Auth'; // Đường dẫn dựa trên thư mục đề xuất
import BookingPage from './pages/BookingPage';
import BookingSuccess from'./pages/BookingSuccess.jsx';
import StaffPage from './pages/staffPage.jsx';

function RoleAwareHome() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let role = typeof window !== 'undefined' ? (localStorage.getItem('role') || '').toLowerCase() : null;
  if (token && !role) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      role = String(payload?.user?.role || payload?.role || '').toLowerCase();
      if (role) localStorage.setItem('role', role);
    } catch (e) {}
  }
  if (token && role === 'staff') {
    return <Navigate to="/staff" replace />;
  }
  return <HomePage />;
}

function StaffOnlyRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let role = typeof window !== 'undefined' ? (localStorage.getItem('role') || '').toLowerCase() : null;
  if (token && !role) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      role = String(payload?.user?.role || payload?.role || '').toLowerCase();
      if (role) localStorage.setItem('role', role);
    } catch (e) {}
  }
  if (!token || role !== 'staff') {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleAwareHome />} />
        <Route path="/auth" element={<RestaurantAuth />} />
        <Route path="/booking" element={<BookingPage/>}/>
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route
          path="/staff"
          element={
            <StaffOnlyRoute>
              <StaffPage />
            </StaffOnlyRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;