import React from 'react';
import { ChefHat, User, ShoppingCart } from 'lucide-react'; 
import {Link} from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <ChefHat className="w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold">Maison de Flavors</h1>
        </div>
        {/* Top Menu */}
        <nav className="hidden md:flex space-x-8">
          <a href="/" className="hover:underline">Trang chủ</a>
          <a href="/menu" className="hover:underline">Menu</a>
         <Link to ="/booking"><a  className="hover:underline">Đặt bàn</a></Link> 
          <a href="/contact" className="hover:underline">Liên hệ</a>
        </nav>
        {/* Login and Cart */}
        <div className="flex items-center space-x-4">
          <a href="/cart" className="hover:text-yellow-200">
            <ShoppingCart className="w-6 h-6" />
          </a>
          <Link to="/auth" className="flex items-center bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-gray-100">
  <User className="w-5 h-5 mr-2" />
  Đăng nhập
</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;