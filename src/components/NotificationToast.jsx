import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Star, Clock, Users, Utensils } from 'lucide-react';

const NotificationToast = ({ 
  type = 'success', 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'premium':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'booking':
        return <Clock className="w-6 h-6 text-purple-600" />;
      case 'table':
        return <Users className="w-6 h-6 text-indigo-600" />;
      case 'order':
        return <Utensils className="w-6 h-6 text-orange-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'premium':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
      case 'booking':
        return 'bg-purple-50 border-purple-200';
      case 'table':
        return 'bg-indigo-50 border-indigo-200';
      case 'order':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'premium':
        return 'text-yellow-800';
      case 'booking':
        return 'text-purple-800';
      case 'table':
        return 'text-indigo-800';
      case 'order':
        return 'text-orange-800';
      default:
        return 'text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${getTextColor()}`}>
              {title}
            </h4>
            <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className={`${getTextColor()} opacity-60 hover:opacity-100 transition-opacity`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
