import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantAuth from './components/Auth/Auth'; // Đường dẫn dựa trên thư mục đề xuất
import BookingPage from './pages/BookingPage';
import BookingSuccess from'./pages/BookingSuccess.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<RestaurantAuth />} />
        <Route path="/booking" element={<BookingPage/>}/>
        <Route path="/booking-success" element={<BookingSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;