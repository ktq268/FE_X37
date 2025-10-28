import React from 'react';
import NotificationToast from '../NotificationToast/NotificationToast';

const NotificationProvider = ({ notifications, onRemove }) => {
  return (
    <div className="notification-container fixed top-0 right-0 z-[9999] pointer-events-none">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationProvider;
