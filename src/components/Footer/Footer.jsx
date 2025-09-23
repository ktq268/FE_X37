import React from 'react';
import { ChefHat, Bell, List, Globe, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Logo */}
        <div className="flex items-center">
          <ChefHat className="w-8 h-8 mr-2" />
          <h1 className="text-xl font-bold">Maison de Flavors</h1>
        </div>
        {/* Notification */}
        <div className="flex flex-col">
          {/* <p className="text-left">NHÀ HÀNG MAISON DE FLAVOR</p>
          <p className="text-left">Địa chỉ: Lầu 9, Tòa nhà International Plaza, Số 343 Phạm Ngũ Lão, Quận 1, TP HCM.</p>
          <p className="text-left">Điện thoại: (028) 38719xx</p>
          <p className="text-left">Tổng đài: 1900-xxxx</p> */}
          <ul className="space-y-2 ml-4 text-left">
            <li><a href="#" className="hover:text-yellow-200">NHÀ HÀNG MAISON DE FLAVOR</a></li>
            <li><a href="#" className="hover:text-yellow-200">Địa chỉ: Lầu 9, Tòa nhà International Plaza, Số 343 Phạm Ngũ Lão, Quận 1, TP HCM.</a></li>
            <li><a href="#" className="hover:text-yellow-200">Điện thoại: (028) 38719xx</a></li>
            <li><a href="#" className="hover:text-yellow-200">Tổng đài: 1900-xxxx</a></li>
          </ul>
        </div>
        {/* List (danh sách footer) */}
        <div className="flex flex-col">
          <ul className="space-y-2 ml-4 text-left">
            <li><a href="#" className="hover:text-yellow-200">Chính sách</a></li>
            <li><a href="#" className="hover:text-yellow-200">Điều khoản</a></li>
            <li><a href="#" className="hover:text-yellow-200">Quy định chung</a></li>
            <li><a href="#" className="hover:text-yellow-200">Chính sách thanh toán khi đặt hàng</a></li>
          </ul>
        </div>
        {/* Kết nối (social links) */}
        <div className="flex flex-col">
          <ul className="space-y-2 text-left">
            <li><a href="#" className="hover:text-yellow-200">HÃY KẾT NỐI VỚI CHÚNG TÔI</a></li>
            <li className="flex space-x-4 mt-2">
              <a href="#" className="hover:text-yellow-200">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-yellow-200">
                <Instagram className="w-6 h-6" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Wave design (commented out as per your removal) */}
      <svg className="w-full h-12 -mt-2" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="#fff" fillOpacity="0.5" />
      </svg>
      {/* Copyright */}
      <div className="container mx-auto px-4 md:px-6 text-center mt-4">
        <p className="text-sm text-white">© 2020 Maison de Flavors</p>
      </div>
    </footer>
  );
};

export default Footer;
