import React, { useState, useEffect } from 'react';
import { ChefHat, User, ShoppingCart, LogOut, ChevronDown } from 'lucide-react'; 
import {Link} from 'react-router-dom'

const Header = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Decode token to get user info
  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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
          
          {userInfo ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <User className="w-5 h-5 mr-2" />
                {userInfo.username}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{userInfo.username}</div>
                    <div className="text-xs text-gray-500">{userInfo.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="flex items-center bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-gray-100">
              <User className="w-5 h-5 mr-2" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;