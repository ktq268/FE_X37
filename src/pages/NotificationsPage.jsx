import React, { useState, useEffect } from 'react';
import { getPendingBookings, updateBookingStatus, getTables } from '../api/api.js';
import { Bell, CheckCircle, XCircle, Calendar, Clock, Users, Phone, Mail, MessageSquare, MapPin, AlertCircle, Building } from 'lucide-react';

const NotificationsPage = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const token = localStorage.getItem('token');

  const fetchPendingBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const bookings = await getPendingBookings(token);
      setPendingBookings(Array.isArray(bookings) ? bookings : []);
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
      setError('Không thể tải thông báo đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async (restaurantId, date, time) => {
    try {
      const tables = await getTables({ 
        restaurantId, 
        date, 
        time 
      }, token);
      
      // Filter only available tables
      const available = tables.filter(table => 
        table.status === 'available' || table.status === 'reserved'
      );
      setAvailableTables(available);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Không thể tải danh sách bàn. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchPendingBookings();
    // Tự động cập nhật mỗi 30 giây
    const interval = setInterval(fetchPendingBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (bookingId) => {
    const booking = pendingBookings.find(b => b._id === bookingId);
    if (!booking) return;
    
    setCurrentBooking(booking);
    await fetchAvailableTables(booking.restaurantId, booking.date, booking.time);
    setShowTableModal(true);
  };

  const confirmAccept = async () => {
    if (!currentBooking || !selectedTableId) return;
    
    try {
      // Update booking with tableId
      await updateBookingStatus(currentBooking._id, 'confirmed', token, { tableId: selectedTableId });
      
      // Update table status to reserved
      try {
        const { updateTableStatusById } = await import('../api/api.js');
        await updateTableStatusById(selectedTableId, 'reserved', token);
      } catch (tableError) {
        console.warn('Could not update table status:', tableError);
      }
      
      // Update UI
      setPendingBookings(pendingBookings.filter(booking => booking._id !== currentBooking._id));
      setShowTableModal(false);
      setSelectedTableId('');
      setCurrentBooking(null);
    } catch (err) {
      console.error('Error accepting booking:', err);
      alert('Không thể xác nhận đặt bàn. Vui lòng thử lại.');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'cancelled', token);
      // Cập nhật UI sau khi từ chối
      setPendingBookings(pendingBookings.filter(booking => booking._id !== bookingId));
    } catch (err) {
      console.error('Error rejecting booking:', err);
      alert('Không thể từ chối đặt bàn. Vui lòng thử lại.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getTimeStatus = (date, time) => {
    const now = new Date();
    const bookingDateTime = new Date(`${date}T${time}`);
    const timeDiff = bookingDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 0) {
      return { status: 'overdue', text: 'Quá hạn', color: 'text-red-600 bg-red-100' };
    } else if (hoursDiff < 1) {
      return { status: 'urgent', text: 'Gấp', color: 'text-orange-600 bg-orange-100' };
    } else if (hoursDiff < 24) {
      return { status: 'today', text: 'Hôm nay', color: 'text-blue-600 bg-blue-100' };
    } else {
      return { status: 'future', text: 'Tương lai', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="mr-2" /> Thông báo đặt bàn
        </h1>
        <button 
          onClick={fetchPendingBookings}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingBookings.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Không có thông báo mới</h3>
          <p className="mt-2 text-gray-500">Hiện tại không có yêu cầu đặt bàn nào đang chờ xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingBookings.map((booking) => {
            const timeStatus = getTimeStatus(booking.date, booking.time);
            return (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
              <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-yellow-800">Yêu cầu đặt bàn mới</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${timeStatus.color}`}>
                      {timeStatus.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{booking.customerName}</h3>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    Chờ xác nhận
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">{formatDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">{formatTime(booking.time)}</span>
                    {timeStatus.status === 'overdue' && (
                      <AlertCircle className="h-4 w-4 ml-2 text-red-500" />
                    )}
                    {timeStatus.status === 'urgent' && (
                      <AlertCircle className="h-4 w-4 ml-2 text-orange-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{booking.adults} người lớn {booking.children > 0 ? `+ ${booking.children} trẻ em` : ''}</span>
                  </div>
                  
                  {booking.customerPhone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  )}
                  
                  {booking.customerEmail && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{booking.customerEmail}</span>
                    </div>
                  )}
                  
                  {booking.note && (
                    <div className="flex items-start text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      <span className="italic">{booking.note}</span>
                    </div>
                  )}

                  {/* Thông tin chi nhánh */}
                  {booking.restaurantName && (
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="font-medium">{booking.restaurantName}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleAccept(booking._id)}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition ${
                      timeStatus.status === 'overdue' 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {timeStatus.status === 'overdue' ? 'Xử lý gấp' : 'Xác nhận'}
                  </button>
                  
                  <button
                    onClick={() => handleReject(booking._id)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      
      {/* Table Selection Modal */}
      {showTableModal && currentBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Chọn bàn cho khách</h3>
              <button 
                onClick={() => {
                  setShowTableModal(false);
                  setSelectedTableId('');
                  setCurrentBooking(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">Thông tin khách hàng:</h4>
                <p className="text-blue-700"><strong>{currentBooking.customerName}</strong></p>
                <p className="text-blue-700">{currentBooking.date} lúc {currentBooking.time}</p>
                <p className="text-blue-700">{currentBooking.adults} người lớn {currentBooking.children > 0 ? `+ ${currentBooking.children} trẻ em` : ''}</p>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Chọn bàn phù hợp:</h4>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {availableTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`p-3 border rounded-lg text-center transition ${
                        selectedTableId === table.id 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="font-bold">Bàn {table.tableNumber}</div>
                      <div className="text-xs">Sức chứa: {table.capacity}</div>
                      <div className="text-xs">Loại: {table.type}</div>
                    </button>
                  ))}
                </div>
                
                {availableTables.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Không có bàn trống vào thời gian này
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowTableModal(false);
                    setSelectedTableId('');
                    setCurrentBooking(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmAccept}
                  disabled={!selectedTableId}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;