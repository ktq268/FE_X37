import React from 'react';
import { Link } from 'react-router-dom'; // Import nếu dùng react-router-dom

const BookingSuccess = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://nvhphunu.vn/wp-content/uploads/2023/11/image32.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-4">Đặt bàn thành công!</h1>
            <p className="text-gray-300 text-lg">
              Quý khách đã đặt bàn thành công. Xác nhận sẽ được gửi về email/SMS sớm nhất có thể.
            </p>
          </div>

          {/* Link về trang chủ */}
          <Link 
            to="/" 
            className="inline-block py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Về lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;