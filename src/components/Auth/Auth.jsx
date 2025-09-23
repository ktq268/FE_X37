import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, ChefHat } from 'lucide-react';
import { registerUser, loginUser } from '../../api/api.js';

const RestaurantAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      // Login
      try {
        const result = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        if (result.token) {
          localStorage.setItem("token", result.token);
          alert("Đăng nhập thành công!");
          console.log("Login result:", result);
        } else {
          alert(result.msg || "Đăng nhập thất bại");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Có lỗi xảy ra khi đăng nhập");
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp");
        setIsLoading(false);
        return;
      }

      try {
        const result = await registerUser({
          username: formData.name,
          email: formData.email,
          phone: formData.phone, // Lưu ý: phone không được lưu do schema
          password: formData.password,
          role: "customer",
        });
        console.log("Register API response:", result);

        // Kiểm tra đăng ký thành công
        if (result.username || result.email) {
          alert("Đăng ký thành công!");
          console.log("Register result:", result);
          // Clear form
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          });
          setIsLogin(true); // Chuyển sang form đăng nhập
        } else {
          alert(result.msg || "Đăng ký thất bại");
        }
      } catch (err) {
        console.error("Register error:", err);
        alert(err.message || "Có lỗi xảy ra khi đăng ký");
      }
    }
    setIsLoading(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Floating Food Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-orange-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-yellow-500 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-red-500 rounded-full opacity-15 animate-ping"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-green-500 rounded-full opacity-25 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Maison de Flavors</h1>
            <p className="text-gray-300">Hương vị tuyệt vời đang chờ bạn</p>
          </div>

          {/* Form Container */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
            {/* Form Toggle */}
            <div className="flex mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-l-lg transition-all duration-300 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : 'bg-transparent text-gray-300 hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-r-lg transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' 
                    : 'bg-transparent text-gray-300 hover:text-white'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field - Only for Register */}
              {!isLogin && (
                <div className="animate-slide-in">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Họ và tên"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="animate-slide-in" style={{ animationDelay: !isLogin ? '0.1s' : '0s' }}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone Field - Only for Register */}
              {!isLogin && (
                <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="animate-slide-in" style={{ animationDelay: !isLogin ? '0.3s' : '0.1s' }}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mật khẩu"
                    className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field - Only for Register */}
              {!isLogin && (
                <div className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Xác nhận mật khẩu"
                      className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password - Only for Login */}
              {isLogin && (
                <div className="text-right animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <button
                    type="button"
                    className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ animationDelay: !isLogin ? '0.5s' : '0.3s' }}
              >
                {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>

            {/* Toggle Text */}
            <div className="text-center mt-6 animate-slide-in" style={{ animationDelay: !isLogin ? '0.6s' : '0.4s' }}>
              <p className="text-gray-300">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  onClick={toggleForm}
                  className="ml-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
              {/* Anchor to Homepage */}
              <a
                href="/"
                className="block mt-2 text-xs font-extralight text-orange-400 hover:text-orange-300 transition-colors"
              >
                Về lại trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAuth;