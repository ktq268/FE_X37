import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ChefHat } from 'lucide-react';
import { forgotPassword } from '../api/api';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Vui lòng nhập email của bạn', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setEmailSent(true);
      showToast('Email đặt lại mật khẩu đã được gửi', 'success');
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
            <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu</h1>
            <p className="text-gray-300">
              {emailSent 
                ? 'Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu cho bạn.' 
                : 'Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.'}
            </p>
          </div>

          {emailSent ? (
            <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white border-opacity-20">
              <div className="text-center">
                <div className="bg-green-500 bg-opacity-20 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Kiểm tra email của bạn</h2>
                <p className="text-gray-300 mb-6">
                  Chúng tôi đã gửi email với hướng dẫn đặt lại mật khẩu đến {email}. Vui lòng kiểm tra hộp thư đến của bạn.
                </p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="w-full py-3 px-4 bg-white bg-opacity-10 text-white font-medium rounded-lg hover:bg-opacity-20 transition-all duration-300"
                  >
                    Gửi lại email
                  </button>
                  <Link
                    to="/auth"
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white border-opacity-20 space-y-6"
            >
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    className="w-full pl-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    required
                  />
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
                  'Gửi hướng dẫn đặt lại mật khẩu'
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

export default ForgotPassword;