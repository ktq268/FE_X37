import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, Phone, ChefHat, ChevronLeft } from 'lucide-react';
import { registerUser, loginUser } from '../../api/api.js';
import { useNotification } from '../../hooks/useNotification.js';
import { useToast } from '../../contexts/ToastContext';

const RestaurantAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { showSuccess: showToastSuccess, showError: showToastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Success message state

  const decodeRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const role = payload?.user?.role || payload?.role || '';
      return String(role).toLowerCase();
    } catch (e) {
      return '';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation phía frontend
    if (!formData.email.trim()) {
      showError(
        "Thiếu thông tin email", 
        isLogin 
          ? "Vui lòng nhập email để đăng nhập vào hệ thống." 
          : "Email là bắt buộc để đăng ký tài khoản mới."
      );
      showToastError("Vui lòng nhập email");
      setIsLoading(false);
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showError(
        "Email không hợp lệ", 
        "Vui lòng nhập đúng định dạng email (ví dụ: example@domain.com)."
      );
      showToastError("Email không đúng định dạng");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      showError(
        "Thiếu mật khẩu", 
        isLogin 
          ? "Vui lòng nhập mật khẩu để đăng nhập vào tài khoản của bạn." 
          : "Mật khẩu là bắt buộc để đăng ký tài khoản mới."
      );
      showToastError("Vui lòng nhập mật khẩu");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      showError(
        "Thiếu họ và tên", 
        "Họ và tên là thông tin bắt buộc để đăng ký tài khoản mới."
      );
      showToastError("Vui lòng nhập họ và tên");
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      showError(
        "Mật khẩu quá ngắn", 
        "Mật khẩu phải có ít nhất 6 ký tự để đảm bảo an toàn cho tài khoản của bạn."
      );
      showToastError("Mật khẩu cần ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }
    
    if (!isLogin && formData.confirmPassword.trim() !== formData.password.trim()) {
      showError(
        "Mật khẩu không khớp", 
        "Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập. Vui lòng kiểm tra lại."
      );
      showToastError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      // Login
      try {
        const result = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        if (result.token) {
          localStorage.setItem("token", result.token);
          // Backend login doesn't return user object; decode role from JWT
          let role = '';
          if (result.user && result.user.role) {
            role = String(result.user.role).toLowerCase();
          } else {
            role = decodeRoleFromToken(result.token);
          }
          if (role) localStorage.setItem('role', role);
          
          // Thông báo thành công dựa trên vai trò
          const roleName = role === 'admin' ? 'quản trị viên' : (role === 'staff' ? 'nhân viên' : 'khách hàng');
          showSuccess(
            "Đăng nhập thành công",
            `Chào mừng ${roleName} đến với hệ thống quản lý nhà hàng Maison de Flavors!`
          );
          showToastSuccess(`Đăng nhập thành công với vai trò ${roleName}!`);
          
          // Hiển thị success message overlay
          setShowSuccessMessage(true);
          
          // Delay redirect để người dùng có thể thấy thông báo
          setTimeout(() => {
            const effectiveRole = (role || localStorage.getItem('role') || '').toLowerCase();
            if (effectiveRole === 'staff') {
              navigate('/staff', { replace: true });
            } else if (effectiveRole === 'admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }, 3000); // Delay 3 giây
          
        } else {
          showError(
            "Đăng nhập thất bại",
            result.msg || "Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu của bạn."
          );
          showToastError("Đăng nhập thất bại - Thông tin không chính xác");
          // Xóa mật khẩu để người dùng nhập lại
          setFormData({
            ...formData,
            password: ''
          });
        }
      } catch (err) {
        console.error("Login error:", err);
        
        // Hiển thị thông báo lỗi đơn giản và rõ ràng
        showError(
          "Đăng nhập thất bại",
          "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập."
        );
        showToastError("Sai tài khoản hoặc mật khẩu");
        
        // Xóa mật khẩu để người dùng nhập lại
        setFormData({
          ...formData,
          password: ''
        });
        
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        showError(
          "Mật khẩu không khớp",
          "Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại."
        );
        setIsLoading(false);
        return;
      }

      try {
        const result = await registerUser({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        });

        // Kiểm tra đăng ký thành công
        if (result.username || result.email) {
          showSuccess(
            "Đăng ký thành công",
            `Chào mừng ${formData.name} đã gia nhập Maison de Flavors! Tài khoản của bạn đã được tạo thành công.`
          );
          showToastSuccess("Đăng ký thành công! Chuyển sang đăng nhập sau 2 giây");

          // Hiển thị success message overlay
          setShowSuccessMessage(true);

          // Đợi 2 giây rồi chuyển sang đăng nhập
          setTimeout(() => {
            // Xóa sạch form đăng ký
            setFormData({
              name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
            });
            setIsLogin(true); // Chuyển sang form đăng nhập
            setShowSuccessMessage(false); // Ẩn overlay
          }, 2000); // Delay 2 giây
        } else {
          // Trường hợp backend không trả về trường hợp thành công rõ ràng
          showError(
            "Đăng ký thất bại",
            result.msg || "Chúng tôi không thể tạo tài khoản lúc này. Vui lòng thử lại sau."
          );
          showToastError("Đăng ký thất bại - Vui lòng thử lại");
          // Xóa toàn bộ form và giữ nguyên ở màn đăng ký
          setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (err) {
        console.error("Register error:", err);

        // Lỗi đã tồn tại hoặc các lỗi khác → hiển thị lỗi, xóa form, KHÔNG chuyển sang đăng nhập
        if (err.message && err.message.includes("User already exists")) {
          showError(
            "Email đã được sử dụng",
            `Email "${formData.email}" đã được đăng ký trong hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn.`
          );
          showToastError("Email đã tồn tại trong hệ thống");
          // Chỉ xóa email và giữ lại các thông tin khác
          setFormData({
            ...formData,
            email: "",
            password: "",
            confirmPassword: "",
          });
        } else if (err.message && err.message.includes("Invalid email")) {
          showError(
            "Email không hợp lệ", 
            `"${formData.email}" không phải là địa chỉ email hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@domain.com).`
          );
          showToastError("Email không đúng định dạng");
          // Chỉ xóa email
          setFormData({
            ...formData,
            email: "",
          });
        } else if (err.message && err.message.includes("Password")) {
          showError(
            "Mật khẩu không hợp lệ", 
            "Mật khẩu phải có ít nhất 6 ký tự và không chứa khoảng trắng ở đầu hoặc cuối."
          );
          showToastError("Mật khẩu không đủ mạnh");
          // Chỉ xóa mật khẩu
          setFormData({
            ...formData,
            password: "",
            confirmPassword: "",
          });
        } else if (err.message && err.message.includes("Username")) {
          showError(
            "Tên người dùng không hợp lệ", 
            "Tên người dùng phải có ít nhất 3 ký tự và không chứa ký tự đặc biệt."
          );
          showToastError("Tên người dùng không hợp lệ");
          // Chỉ xóa tên
          setFormData({
            ...formData,
            name: "",
          });
        } else {
          showError(
            "Lỗi hệ thống",
            err.message || "Chúng tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ."
          );
          showToastError("Lỗi hệ thống - Vui lòng thử lại sau");
          // Giữ nguyên form để người dùng có thể thử lại
        }
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
              {/* Back Button */}
              <button
                type="button"
                onClick={() => isLogin ? navigate('/') : setIsLogin(true)}
                className="absolute top-0.5 left-0.5 z-20 w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300"
                aria-label="Quay về"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

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
                    onClick={() => navigate('/forgot-password')}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ animationDelay: !isLogin ? '0.5s' : '0.3s' }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  isLogin ? 'Đăng nhập' : 'Đăng ký'
                )}
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
            </div>
          </div>
        </div>
      </div>

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounce">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h3>
            <p className="text-gray-600 mb-4">
              {isLogin ? 'Đăng nhập thành công! Đang chuyển hướng...' : 'Đăng ký thành công! Chuyển sang đăng nhập...'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantAuth;