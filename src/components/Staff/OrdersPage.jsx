import React from 'react';
import { RefreshCw } from 'lucide-react';
import HeaderComponent from './HeaderComponent';
import CompactOrderCard from './CompactOrderCard';

const OrdersPage = ({
  selectedRestaurant,
  currentDateTime,
  staffInfo,
  onLogout,
  errorMessage,
  filterStatus,
  onFilterChange,
  loadingOrders,
  filteredOrders,
  statusConfig,
  onOrderClick,
  onRefreshOrders,
  currentOrdersTable
}) => {
  return (
    <div className="h-full flex flex-col">
      <HeaderComponent 
        selectedRestaurant={selectedRestaurant}
        currentDateTime={currentDateTime}
        staffInfo={staffInfo}
        onLogout={onLogout}
      />

      {errorMessage && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Order</h2>
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="preparing">Đang chế biến</option>
            <option value="served">Đã phục vụ</option>
            <option value="completed">Hoàn tất</option>
          </select>
          <button 
            onClick={onRefreshOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>
      
      {loadingOrders ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Đang tải orders...</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredOrders.length === 0 ? (
            <div className="text-gray-500 text-sm">Không có order</div>
          ) : (
            filteredOrders.map(order => (
              <CompactOrderCard 
                key={order.id} 
                order={order} 
                statusConfig={statusConfig}
                onOrderClick={onOrderClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
