import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Lock, Unlock, Users } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification.js';

const TableModal = ({
  showTableModal,
  selectedTable,
  selectedDate,
  selectedRestaurant,
  tableStatusConfig,
  orders,
  onClose,
  onChangeTableStatus,
  onRefreshOrdersForTable,
  onUpdateBookingStatus,
  onCreateBookingForTable,
  onLoadTableBookingInfo
}) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateTime: '',
    adults: '',
    children: 0,
    note: ''
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [tableBookingInfo, setTableBookingInfo] = useState(null);
  const [loadingBookingInfo, setLoadingBookingInfo] = useState(false);
  
  const { showSuccess, showError, showWarning, showBooking } = useNotification();

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({ ...prev, [name]: value }));
  };

  // Load booking info when modal opens
  useEffect(() => {
    if (showTableModal && selectedTable) {
      loadTableBookingInfo();
    }
  }, [showTableModal, selectedTable]);

  const loadTableBookingInfo = async () => {
    if (selectedTable.status !== 'reserved') {
      setTableBookingInfo(null);
      return;
    }

    setLoadingBookingInfo(true);
    try {
      const bookingInfo = await onLoadTableBookingInfo(selectedTable, selectedDate);
      setTableBookingInfo(bookingInfo);
    } catch (e) {
      console.error('Error loading booking info:', e);
      setTableBookingInfo(null);
    } finally {
      setLoadingBookingInfo(false);
    }
  };

  const createBookingForTable = async () => {
    if (!bookingFormData.firstName || !bookingFormData.lastName || !bookingFormData.email || 
        !bookingFormData.phone || !bookingFormData.dateTime || !bookingFormData.adults) {
      showWarning(
        'Thông tin không đầy đủ',
        'Vui lòng điền đầy đủ tất cả các thông tin bắt buộc để đặt bàn.'
      );
      return;
    }

    setIsCreatingBooking(true);
    try {
      await onCreateBookingForTable(bookingFormData, selectedTable, selectedRestaurant);
      
      // Reset form but keep modal open to show booking info
      setBookingFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateTime: '',
        adults: '',
        children: 0,
        note: ''
      });
      setShowBookingForm(false);
      
      // Reload booking info
      await loadTableBookingInfo();
      
      showBooking(
        'Đặt bàn thành công',
        `Bàn ${selectedTable.tableNumber} đã được đặt cho ${bookingFormData.firstName} ${bookingFormData.lastName}. Thông tin xác nhận đã được gửi qua email.`
      );
    } catch (e) {
      console.error('Error creating booking:', e);
      showError(
        'Đặt bàn thất bại',
        e.message || 'Chúng tôi không thể xử lý yêu cầu đặt bàn lúc này. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.'
      );
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (!showTableModal || !selectedTable) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Bàn số {selectedTable.tableNumber}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Trạng thái hiện tại:</div>
            <div className="font-bold text-lg">{(tableStatusConfig[selectedTable.status] || tableStatusConfig['available']).label}</div>
            <div className="text-sm text-gray-500 mt-1">
              📅 Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              🪑 Loại bàn: <span className={`font-medium ${selectedTable.type === 'vip' ? 'text-yellow-600' : 'text-blue-600'}`}>
                {selectedTable.type === 'vip' ? 'VIP' : 'Normal'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              👥 Sức chứa: {selectedTable.capacity} người
            </div>
            
            {/* Hiển thị thông tin booking chi tiết cho bàn reserved */}
            {selectedTable.status === 'reserved' && (
              <div className="mt-3">
                {loadingBookingInfo ? (
                  <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-sm text-blue-700">Đang tải thông tin booking...</div>
                  </div>
                ) : tableBookingInfo ? (
                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-sm font-medium text-blue-800 mb-2">📋 Thông tin đặt bàn:</div>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div><span className="font-medium">Khách hàng:</span> {tableBookingInfo.customerName}</div>
                      <div><span className="font-medium">Email:</span> {tableBookingInfo.customerEmail}</div>
                      <div><span className="font-medium">SĐT:</span> {tableBookingInfo.customerPhone}</div>
                      <div><span className="font-medium">Ngày đặt:</span> {new Date(tableBookingInfo.date).toLocaleDateString('vi-VN')}</div>
                      <div><span className="font-medium">Thời gian:</span> {tableBookingInfo.time}</div>
                      <div><span className="font-medium">Số khách:</span> {tableBookingInfo.adults} người lớn {tableBookingInfo.children > 0 ? `+ ${tableBookingInfo.children} trẻ em` : ''}</div>
                      {tableBookingInfo.note && (
                        <div><span className="font-medium">Ghi chú:</span> {tableBookingInfo.note}</div>
                      )}
                      <div><span className="font-medium">Trạng thái:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          tableBookingInfo.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tableBookingInfo.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                    <div className="text-sm text-gray-600">Không có thông tin booking</div>
                  </div>
                )}
              </div>
            )}
            
            {selectedTable.status === 'occupied' && selectedTable.checkInTime && (
              <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                <div className="text-sm font-medium text-red-800">👥 Khách đang dùng từ:</div>
                <div className="text-sm text-red-700">{selectedTable.checkInTime}</div>
              </div>
            )}
            
            {selectedTable.status === 'blocked' && selectedTable.blockedBy && (
              <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <div className="text-sm font-medium text-yellow-800">🔒 Lý do khóa:</div>
                <div className="text-sm text-yellow-700">{selectedTable.blockedBy}</div>
              </div>
            )}
            
            {selectedTable.orderId && (
              <div className="mt-2 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                <div className="text-sm font-medium text-purple-800">🍽️ Order ID:</div>
                <div className="text-sm text-purple-700">#{selectedTable.orderId}</div>
              </div>
            )}
          </div>
          
          {!showBookingForm ? (
            <div className="space-y-3">
              <h4 className="font-bold">Chuyển trạng thái:</h4>
              
              {/* Nút cho bàn available */}
              {selectedTable.status === 'available' && (
                <>
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Đặt bàn cho khách
                  </button>
                  
                  <button
                    onClick={() => {
                      onChangeTableStatus(selectedTable.tableNumber, 'blocked', 'Bảo trì');
                      onClose();
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Lock size={20} />
                    Khóa bàn tạm thời
                  </button>
                </>
              )}
              
              {/* Nút cho bàn reserved */}
              {selectedTable.status === 'reserved' && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        // Cancel all active bookings for this table
                        const activeBookings = orders.filter(order => 
                          order.status !== 'completed' && 
                          String(order.tableNumber) === String(selectedTable.tableNumber)
                        );
                        
                        // Cancel each active booking
                        for (const booking of activeBookings) {
                          await onUpdateBookingStatus(booking.bookingId || booking.id, 'cancelled');
                        }
                        
                        // Then update table status to available
                        await onChangeTableStatus(selectedTable.tableNumber, 'available');
                        
                        // Refresh orders for this table
                        await onRefreshOrdersForTable(selectedTable);
                        
                        // Reload booking info
                        await loadTableBookingInfo();
                        
                        onClose();
                      } catch (e) {
                        showError(
                          'Hủy booking thất bại',
                          e.message || 'Chúng tôi không thể hủy booking và đặt bàn trống lúc này. Vui lòng thử lại sau.'
                        );
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Unlock size={20} />
                    Đặt trạng thái TRỐNG
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        // Update all confirmed bookings for this table to seated
                        const activeBookings = orders.filter(order => 
                          order.status === 'preparing' && 
                          String(order.tableNumber) === String(selectedTable.tableNumber)
                        );
                        
                        // Update each booking to seated
                        for (const booking of activeBookings) {
                          await onUpdateBookingStatus(booking.bookingId || booking.id, 'seated');
                        }
                        
                        // Then update table status to occupied
                        await onChangeTableStatus(selectedTable.tableNumber, 'occupied');
                        
                        // Refresh orders for this table
                        await onRefreshOrdersForTable(selectedTable);
                        
                        // Reload booking info
                        await loadTableBookingInfo();
                        
                        onClose();
                      } catch (e) {
                        showError(
                          'Cập nhật trạng thái thất bại',
                          e.message || 'Chúng tôi không thể cập nhật trạng thái khách đang dùng lúc này. Vui lòng thử lại sau.'
                        );
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Users size={20} />
                    Khách đang dùng
                  </button>
                </>
              )}
              
              {/* Nút cho bàn blocked */}
              {selectedTable.status === 'blocked' && (
                <button
                  onClick={async () => {
                    try {
                      // Cancel all active bookings for this table
                      const activeBookings = orders.filter(order => 
                        order.status !== 'completed' && 
                        String(order.tableNumber) === String(selectedTable.tableNumber)
                      );
                      
                      // Cancel each active booking
                      for (const booking of activeBookings) {
                        await onUpdateBookingStatus(booking.bookingId || booking.id, 'cancelled');
                      }
                      
                      // Then update table status to available
                      await onChangeTableStatus(selectedTable.tableNumber, 'available');
                      
                      // Refresh orders for this table
                      await onRefreshOrdersForTable(selectedTable);
                      
                      // Reload booking info
                      await loadTableBookingInfo();
                      
                      onClose();
                    } catch (e) {
                      showError(
                        'Mở khóa bàn thất bại',
                        e.message || 'Chúng tôi không thể mở khóa bàn lúc này. Vui lòng thử lại sau.'
                      );
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Unlock size={20} />
                  Mở khóa bàn
                </button>
              )}
              
              {/* Nút cho bàn occupied */}
              {selectedTable.status === 'occupied' && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        // Tìm các booking đang active cho bàn này
                        const activeBookings = orders.filter(order => 
                          order.status === 'served' && 
                          String(order.tableNumber) === String(selectedTable.tableNumber)
                        );
                        
                        // Cập nhật trạng thái booking thành completed
                        for (const booking of activeBookings) {
                          await onUpdateBookingStatus(booking.bookingId || booking.id, 'completed');
                        }
                        
                        // Cập nhật trạng thái bàn thành available (trống)
                        await onChangeTableStatus(selectedTable.tableNumber, 'available');
                        
                        // Refresh orders for this table
                        await onRefreshOrdersForTable(selectedTable);
                        
                        // Reload booking info
                        await loadTableBookingInfo();
                        
                        showSuccess(
                          'Hoàn tất thành công',
                          'Đã chuyển trạng thái booking thành hoàn tất và bàn thành trống.'
                        );
                        
                        onClose();
                      } catch (e) {
                        showError(
                          'Hoàn tất thất bại',
                          e.message || 'Chúng tôi không thể hoàn tất booking và chuyển bàn về trạng thái trống lúc này. Vui lòng thử lại sau.'
                        );
                      }
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Hoàn tất
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        // Update all active bookings for this table to cancelled
                        const activeBookings = orders.filter(order => 
                          order.status !== 'completed' && 
                          String(order.tableNumber) === String(selectedTable.tableNumber)
                        );
                        
                        // Update each booking to cancelled
                        for (const booking of activeBookings) {
                          await onUpdateBookingStatus(booking.bookingId || booking.id, 'cancelled');
                        }
                        
                        // Then update table status to available
                        await onChangeTableStatus(selectedTable.tableNumber, 'available');
                        
                        // Refresh orders for this table
                        await onRefreshOrdersForTable(selectedTable);
                        
                        // Reload booking info
                        await loadTableBookingInfo();
                        
                        onClose();
                      } catch (e) {
                        showError(
                          'Cập nhật trạng thái bàn thất bại',
                          e.message || 'Chúng tôi không thể chuyển bàn về trạng thái trống lúc này. Vui lòng thử lại sau.'
                        );
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Unlock size={20} />
                    Chuyển về TRỐNG
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Form đặt bàn đầy đủ */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg">📋 Đặt bàn cho khách</h4>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={bookingFormData.firstName}
                    onChange={handleBookingFormChange}
                    placeholder="Tên khách hàng"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={bookingFormData.lastName}
                    onChange={handleBookingFormChange}
                    placeholder="Họ khách hàng"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={bookingFormData.email}
                    onChange={handleBookingFormChange}
                    placeholder="Email khách hàng"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingFormData.phone}
                    onChange={handleBookingFormChange}
                    placeholder="Số điện thoại"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giờ *</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={bookingFormData.dateTime}
                    onChange={handleBookingFormChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số người lớn *</label>
                  <input
                    type="number"
                    name="adults"
                    value={bookingFormData.adults}
                    onChange={handleBookingFormChange}
                    placeholder="Số người lớn"
                    min="1"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số trẻ em</label>
                  <input
                    type="number"
                    name="children"
                    value={bookingFormData.children}
                    onChange={handleBookingFormChange}
                    placeholder="Số trẻ em"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  name="note"
                  value={bookingFormData.note}
                  onChange={handleBookingFormChange}
                  placeholder="Ghi chú đặc biệt (nếu có)"
                  className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
                >
                  Hủy
                </button>
                <button
                  onClick={createBookingForTable}
                  disabled={isCreatingBooking}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Tạo booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableModal;
