import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ChefHat } from 'lucide-react';
import { resetPassword } from '../api/api';
import { useToast } from '../contexts/ToastContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      showToast('Token đặt lại mật khẩu không hợp lệ', 'error');
      navigate('/auth');
    }
  }, [token, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('Mật khẩu không khớp', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, password);
      setResetSuccess(true);
      showToast('Mật khẩu đã được đặt lại thành công', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsLoading(false);
    }
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ChefHat className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
            <p className="text-gray-300">
              {resetSuccess 
                ? 'Mật khẩu của bạn đã được đặt lại thành công.' 
                : 'Tạo mật khẩu mới cho tài khoản của bạn.'}
            </p>
          </div>

          {resetSuccess ? (
            <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white border-opacity-20">
              <div className="text-center">
                <div className="bg-green-500 bg-opacity-20 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Đặt lại mật khẩu thành công</h2>
                <p className="text-gray-300 mb-6">
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
                <Link
                  to="/auth"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white border-opacity-20 space-y-6"
            >
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;