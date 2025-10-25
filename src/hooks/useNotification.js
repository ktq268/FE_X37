import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      onClose: () => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const showSuccess = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showError = useCallback((title, message, duration = 5000) => {
    return showNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showWarning = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showInfo = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showPremium = useCallback((title, message, duration = 5000) => {
    return showNotification({
      type: 'premium',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showBooking = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'booking',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showTable = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'table',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showOrder = useCallback((title, message, duration = 4000) => {
    return showNotification({
      type: 'order',
      title,
      message,
      duration
    });
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPremium,
    showBooking,
    showTable,
    showOrder,
    clearAll
  };
};
