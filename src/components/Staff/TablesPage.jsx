import React from 'react';
import { RefreshCw, Filter, MapPin } from 'lucide-react';
import HeaderComponent from './HeaderComponent';

const TablesPage = ({
  selectedRestaurant,
  currentDateTime,
  staffInfo,
  onLogout,
  errorMessage,
  loadingTables,
  tables,
  tableStatusConfig,
  selectedRegion,
  selectedDate,
  onRegionChange,
  onRestaurantChange,
  onDateChange,
  onTableClick,
  onRefreshTables,
  getUniqueRegions,
  getRestaurantsByRegion,
  showWarning
}) => {
  // Handle region change with notification
  const handleRegionChange = (region) => {
    onRegionChange(region);
    if (region && !selectedRestaurant) {
      showWarning(
        'Vui lòng chọn chi nhánh',
        'Bạn cần chọn chi nhánh trước khi xem danh sách bàn. Vui lòng chọn chi nhánh từ danh sách.'
      );
    }
  };

  // Handle restaurant change with notification
  const handleRestaurantChange = (restaurantId) => {
    onRestaurantChange(restaurantId);
    if (!restaurantId && selectedRegion) {
      showWarning(
        'Vui lòng chọn chi nhánh cụ thể',
        'Để xem danh sách bàn, bạn cần chọn một chi nhánh cụ thể thay vì để trống.'
      );
    }
  };

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
        <h2 className="text-xl font-bold">Quản lý Bàn</h2>
        <button 
          onClick={onRefreshTables}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>
      
      {/* Restaurant Filter */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Lọc theo chi nhánh và thời gian
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Miền</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Chọn miền</option>
              {getUniqueRegions().map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chi nhánh</label>
            <select
              value={selectedRestaurant?._id || selectedRestaurant?.id || ''}
              onChange={(e) => handleRestaurantChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              disabled={!selectedRegion}
            >
              <option value="">Chọn chi nhánh</option>
              {getRestaurantsByRegion().map(restaurant => (
                <option key={restaurant._id || restaurant.id} value={restaurant._id || restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>
        {selectedRestaurant && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Đang xem: {selectedRestaurant.name} - {selectedDate}</span>
            </div>
          </div>
        )}
      </div>

      {loadingTables ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Đang tải danh sách bàn...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 overflow-y-auto">
          {tables.length === 0 ? (
            <div className="text-gray-500 text-sm">Không có bàn</div>
          ) : (
            tables.map(table => {
              const config = tableStatusConfig[table.status] || tableStatusConfig['available'];
              return (
                <div 
                  key={table.id || table._id || `table-${table.tableNumber}`}
                  onClick={() => onTableClick(table)}
                  className={`border-2 ${config.borderColor} rounded-lg p-3 ${config.bgColor} text-center cursor-pointer hover:shadow-lg transition-all`}
                >
                  <div className="font-bold text-lg mb-1">Bàn {table.tableNumber}</div>
                  <div className={`text-xs ${config.textColor} font-medium mb-1`}>{config.label}</div>
                  
                  {/* Hiển thị thông tin booking */}
                  {table.status === 'reserved' && table.blockedBy && (
                    <div className="text-xs text-blue-600 font-medium">
                      📋 {table.blockedBy}
                    </div>
                  )}
                  
                  {table.status === 'occupied' && table.checkInTime && (
                    <div className="text-xs text-red-600 font-medium">
                      👥 {table.checkInTime}
                    </div>
                  )}
                  
                  {table.status === 'blocked' && table.blockedBy && (
                    <div className="text-xs text-yellow-600 font-medium">
                      🔒 {table.blockedBy}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TablesPage;
