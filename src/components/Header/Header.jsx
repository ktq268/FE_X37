import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, User, ShoppingCart, LogOut } from 'lucide-react'; 
import {Link, useNavigate} from 'react-router-dom'
import { getCurrentUser } from '../../api/api.js';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getCurrentUser(token)
      .then((user) => {
        setUserInfo(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserInfo(null);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 shadow-lg fixed top-0 left-0 right-0 z-[9999]">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <ChefHat className="w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold">Maison de Flavors</h1>
        </div>
        {/* Top Menu */}
        <nav className="hidden md:flex space-x-8">
          <a href="/" className="hover:underline">
            Trang chủ
          </a>
          <a href="/menu" className="hover:underline">
            Menu
          </a>
          <Link to="/booking">
            <a className="hover:underline">Đặt bàn</a>
          </Link>
          <a href="/contact" className="hover:underline">
            Liên hệ
          </a>
        </nav>
        {/* Login and Cart */}
        <div className="flex items-center space-x-4">
          <a href="/cart" className="hover:text-yellow-200">
            <ShoppingCart className="w-6 h-6" />
          </a>
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen((v) => !v)}
                className="flex items-center bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <User className="w-5 h-5 mr-2" />
                {userInfo?.username || userInfo?.name || 'Tài khoản'}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-orange-500" />
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
