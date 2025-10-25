import React from 'react';
import { ChefHat, Users, Bell, CreditCard } from 'lucide-react';

const Navigation = ({
  currentPage,
  onPageChange,
  pendingCount,
  orders
}) => {
  return (
    <nav className="bg-white border-t shadow-lg">
      <div className="flex justify-around">
        <button
          onClick={() => onPageChange('orders')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
            currentPage === 'orders' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ChefHat size={24} />
          <span className="text-xs font-medium">Orders</span>
        </button>
        <button
          onClick={() => onPageChange('tables')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
            currentPage === 'tables' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users size={24} />
          <span className="text-xs font-medium">Bàn</span>
        </button>
        <button
          onClick={() => {
            onPageChange('notifications');
            // Reset pending count when navigating to notifications
            if (typeof onPageChange === 'function' && onPageChange.resetPendingCount) {
              onPageChange.resetPendingCount();
            }
          }}
          className={`relative flex-1 py-4 flex flex-col items-center gap-1 transition ${
            currentPage === 'notifications' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="relative">
            <Bell size={24} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-[5px] py-[1px] font-bold">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Thông báo</span>
        </button>
          
        <button
          onClick={() => {
            onPageChange('invoice', orders[0]);
          }}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
            currentPage === 'invoice' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CreditCard size={24} />
          <span className="text-xs font-medium">Hóa đơn</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
