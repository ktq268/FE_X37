import React from 'react';
import NotificationToast from './NotificationToast';

const NotificationProvider = ({ children, notifications }) => {
  return (
    <>
      {children}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          {...notification}
        />
      ))}
    </>
  );
};

export default NotificationProvider;
