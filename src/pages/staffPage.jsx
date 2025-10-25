import React, { useState, useEffect } from 'react';
import { getTables, updateTableStatusById, getBookingsByTable, updateBookingStatus, getPendingBookings, getRestaurants } from '../api/api.js';
import { Building, LogOut } from 'lucide-react';
import NotificationsPage from './NotificationsPage.jsx';
import { useNotification } from '../hooks/useNotification.js';

// Import các component mới
import {
  OrdersPage,
  TablesPage,
  InvoicePage,
  TableModal,
  OrderDetailModal,
  Navigation
} from '../components/Staff';

const staffPage = () => {
  const [currentPage, setCurrentPage] = useState('orders');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTableModal, setShowTableModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentOrdersTable, setCurrentOrdersTable] = useState(null);

  // Restaurant and staff info
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshTimeout, setRefreshTimeout] = useState(null);
  const [lastApiCall, setLastApiCall] = useState(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { showSuccess, showError, showOrder, showWarning } = useNotification();

  const beToFeOrderStatus = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'confirmed': return 'preparing';
      case 'seated': return 'served';
      case 'completed': return 'completed';
      case 'cancelled': return 'completed';
      case 'no_show': return 'completed';
      default: return 'pending';
    }
  };

  const feToBeOrderStatus = (status) => {
    switch (status) {
      case 'pending': return 'confirmed';
      case 'preparing': return 'seated';
      case 'served': return 'completed';
      case 'completed': return 'completed';
      default: return 'confirmed';
    }
  };

  const mapBookingToOrder = (booking) => {
    const items = Array.isArray(booking.items) ? booking.items : [];
    const total = booking.total || items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 0)), 0);
    return {
      id: booking._id || booking.id || booking.code || '',
      bookingId: booking._id || booking.id || '',
      customerName: booking.customerName || booking.name || 'Khách lẻ',
      tableNumber: booking.tableNumber || (booking.table && booking.table.tableNumber) || (currentOrdersTable && currentOrdersTable.tableNumber) || '',
      createdAt: booking.createdAtClient || booking.createdAt || '',
      items: items.map(it => ({
        name: it.name || it.itemName || '',
        quantity: it.quantity || 0,
        price: it.price || 0,
        note: it.note || ''
      })),
      total,
      status: beToFeOrderStatus(booking.status),
      note: booking.note || ''
    };
  };

  const loadStaffInfo = () => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        setStaffInfo(payload.user || payload);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  };

  const updateDateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    setCurrentDateTime(now.toLocaleDateString('vi-VN', options));
  };

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants({}, token);
      setRestaurants(Array.isArray(data) ? data : (data?.restaurants || []));
    } catch (e) {
      console.error('Error loading restaurants:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  // Hàm load bàn với debounce
  const refreshTables = async (query = {}) => {
    setLoadingTables(true);
    setErrorMessage('');

    try {
      const queryWithTime = {
        ...query,
        date: query.date || selectedDate,
      };

      const data = await getTables(queryWithTime, token);

      setTables(Array.isArray(data) ? data : (data?.tables || []));
      if (!currentOrdersTable && (Array.isArray(data) ? data.length : (data?.tables || []).length)) {
        const list = Array.isArray(data) ? data : data.tables;
        const first = list[0];
        setCurrentOrdersTable(first);
        await refreshOrdersForTable(first);
      }
    } catch (e) {
      console.error('Error fetching tables:', e);
      setErrorMessage(e.message || 'Không tải được danh sách bàn');
    } finally {
      setLoadingTables(false);
    }
  };

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefreshTables = (query = {}) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    // Rate limiting: minimum 1 second between API calls
    if (timeSinceLastCall < 1000) {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      const timeout = setTimeout(() => {
        setLastApiCall(Date.now());
        refreshTables(query);
      }, 1000 - timeSinceLastCall);
      
      setRefreshTimeout(timeout);
    } else {
      setLastApiCall(now);
      refreshTables(query);
    }
  };

const loadPendingNotifications = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  // Rate limiting: minimum 2 seconds between notification API calls
  if (timeSinceLastCall < 2000) {
    return;
  }
  
  try {
    setLastApiCall(now);
    const data = await getPendingBookings(token);
    const pendingBookings = Array.isArray(data) ? data : (data?.bookings || []);
    setPendingCount(pendingBookings.length);
  } catch (e) {
    console.error("Error loading pending bookings:", e);
  }
};


  const refreshOrdersForTable = async (table) => {
    if (!table) return;
    setLoadingOrders(true);
    setErrorMessage('');
    try {
      const res = await getBookingsByTable(table.id || table._id || table.tableNumber, { date: selectedDate }, token);
      const list = Array.isArray(res) ? res : (res?.bookings || []);
      setOrders(list.map(mapBookingToOrder));
    } catch (e) {
      setErrorMessage(e.message || 'Không tải được order của bàn');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadStaffInfo();
    updateDateTime();
    loadRestaurants();
    refreshTables({});
    loadPendingNotifications();

    // Update time every minute
    const interval = setInterval(() => {
      updateDateTime();
      loadPendingNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []); // Empty dependency array to run only once on mount

  const statusConfig = {
    pending: { label: 'Chờ XN', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
    preparing: { label: 'Đang làm', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
    served: { label: 'Đã phục vụ', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
    completed: { label: 'Hoàn tất', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' }
  };

  const tableStatusConfig = {
    available: { label: 'Trống', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
    reserved: { label: 'Đã đặt', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
    blocked: { label: 'Khóa', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
    occupied: { label: 'Đang dùng', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' }
  };

  // CompactOrderCard đã được tách thành component riêng

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const beStatus = feToBeOrderStatus(newStatus);
      await updateBookingStatus(order.bookingId || orderId, beStatus, token);
      await refreshOrdersForTable(currentOrdersTable);
    } catch (e) {
      showError(
        'Cập nhật trạng thái đơn hàng thất bại',
        e.message || 'Chúng tôi không thể cập nhật trạng thái đơn hàng lúc này. Vui lòng thử lại sau.'
      );
    }
  };

  const changeTableStatus = async (tableNumber, newStatus, customerInfo = null) => {
    try {
      const table = tables.find(t => String(t.tableNumber) === String(tableNumber));
      if (!table) throw new Error(`Không tìm thấy bàn số ${tableNumber}`);
  
      const tableId = table._id || table.id;
      if (!tableId) throw new Error(`Không tìm thấy ID của bàn ${tableNumber}`);
  
      // Cập nhật trạng thái trên server với thông tin ngày được chọn
      await updateTableStatusById(tableId, newStatus, token, { date: selectedDate });

      // Gọi lại API để đồng bộ trạng thái bàn mới nhất cho ngày được chọn
      await refreshTables(selectedRestaurant ? { 
        restaurantId: selectedRestaurant._id || selectedRestaurant.id,
        date: selectedDate 
      } : { date: selectedDate });

      // Nếu đang xem bàn này thì load lại order
      if (currentOrdersTable && String(currentOrdersTable.tableNumber) === String(tableNumber)) {
        await refreshOrdersForTable(table);
      }
    } catch (e) {
      showError(
        'Cập nhật trạng thái bàn thất bại',
        e.message || 'Chúng tôi không thể cập nhật trạng thái bàn lúc này. Vui lòng thử lại sau.'
      );
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const handleRegionChange = async (region) => {
    setSelectedRegion(region);
    setSelectedRestaurant(null);
    setTables([]);
    
    if (region) {
      try {
        // Load restaurants for the selected region
        const data = await getRestaurants({ region }, token);
        const regionRestaurants = Array.isArray(data) ? data : (data?.restaurants || []);
        
        if (regionRestaurants.length > 0) {
          setSelectedRestaurant(regionRestaurants[0]);
          refreshTables({ restaurantId: regionRestaurants[0]._id || regionRestaurants[0].id });
        } else {
          showWarning(
            'Không có chi nhánh',
            'Không tìm thấy chi nhánh nào trong miền đã chọn. Vui lòng chọn miền khác.'
          );
        }
      } catch (e) {
        console.error('Error loading restaurants for region:', e);
        setErrorMessage('Không thể tải danh sách chi nhánh cho miền này');
        showWarning(
          'Lỗi tải dữ liệu',
          'Không thể tải danh sách chi nhánh. Vui lòng thử lại sau.'
        );
      }
    }
  };

  const handleRestaurantChange = (restaurantId) => {
    const restaurant = restaurants.find(r => (r._id || r.id) === restaurantId);
    setSelectedRestaurant(restaurant);
    if (!restaurant && selectedRegion) {
      showWarning(
        'Vui lòng chọn chi nhánh',
        'Bạn cần chọn chi nhánh để xem danh sách bàn và đơn hàng. Vui lòng chọn chi nhánh từ danh sách.'
      );
    }
    refreshTables({ restaurantId });
  };


  const getUniqueRegions = () => {
    return [
      { value: "south", label: "Miền Nam (Hồ Chí Minh,...)" },
      { value: "north", label: "Miền Bắc (Hà Nội,...)" },
      { value: "central", label: "Miền Trung (Đà Nẵng,...)" }
    ];
  };

  const getRestaurantsByRegion = () => {
    return selectedRegion ? restaurants.filter(r => r.region === selectedRegion) : [];
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
  };


  // OrdersPage đã được tách thành component riêng

  // TablesPage đã được tách thành component riêng

  // InvoicePage đã được tách thành component riêng

  // TableModal đã được tách thành component riêng

  // OrderDetailModal đã được tách thành component riêng

  // Handler functions for components
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setShowTableModal(true);
    setCurrentOrdersTable(table);
    await refreshOrdersForTable(table);
  };

  const handlePageChange = (page, order = null) => {
    setCurrentPage(page);
    if (order) {
      setSelectedOrder(order);
    }
    if (page === 'notifications') {
      setPendingCount(0);
    }
  };

  const handleTableModalClose = () => {
    setShowTableModal(false);
  };

  const handleOrderDetailModalClose = () => {
    setShowOrderDetailModal(false);
  };

  const handleGoToInvoice = () => {
    setCurrentPage('invoice');
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    debouncedRefreshTables({
      restaurantId: selectedRestaurant?._id || selectedRestaurant?.id,
      date: newDate,
    });
  };

  const handleRefreshTables = () => {
    refreshTables(selectedRestaurant ? { restaurantId: selectedRestaurant._id || selectedRestaurant.id } : {});
  };

  const handleRefreshOrders = () => {
    if (currentOrdersTable) {
      refreshOrdersForTable(currentOrdersTable);
    }
  };

  const handleLoadTableBookingInfo = async (table, date) => {
    const tableId = table._id || table.id;
    const res = await getBookingsByTable(tableId, { date }, token);
    const bookings = Array.isArray(res) ? res : (res?.bookings || []);
    
    // Find the most recent active booking (prioritize confirmed bookings)
    const activeBooking = bookings.find(booking => 
      booking.status === 'confirmed'
    ) || bookings.find(booking => 
      booking.status === 'pending'
    );
    
    return activeBooking || null;
  };

  const handleCreateBookingForTable = async (bookingFormData, table, restaurant) => {
    const [date, time] = bookingFormData.dateTime.split('T');
    
    // Import createReservation and updateBookingStatus functions
    const { createReservation, updateBookingStatus } = await import('../api/api.js');
    
    const bookingData = {
      restaurantId: restaurant?._id || restaurant?.id,
      tableId: table._id || table.id,
      date: date,
      time: time,
      adults: parseInt(bookingFormData.adults),
      children: parseInt(bookingFormData.children) || 0,
      customerName: `${bookingFormData.firstName} ${bookingFormData.lastName}`,
      customerPhone: bookingFormData.phone,
      customerEmail: bookingFormData.email,
      note: bookingFormData.note,
    };

    const result = await createReservation(bookingData, token);
    
    // Immediately update status to confirmed since staff created it directly
    if (result && result._id) {
      await updateBookingStatus(result._id, 'confirmed', token);
    }
    
    if (result && result._id) {
      // Update table status to reserved
      await changeTableStatus(table.tableNumber, 'reserved', `${bookingFormData.firstName} ${bookingFormData.lastName} - ${time}`);
    } else {
      throw new Error('Đặt bàn thất bại');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg shadow-lg h-full p-4 overflow-y-auto">
          {currentPage === 'orders' && (
            <OrdersPage
              selectedRestaurant={selectedRestaurant}
              currentDateTime={currentDateTime}
              staffInfo={staffInfo}
              onLogout={handleLogout}
              errorMessage={errorMessage}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              loadingOrders={loadingOrders}
              filteredOrders={filteredOrders}
              statusConfig={statusConfig}
              onOrderClick={handleOrderClick}
              onRefreshOrders={handleRefreshOrders}
              currentOrdersTable={currentOrdersTable}
            />
          )}
          {currentPage === 'tables' && (
            <TablesPage
              selectedRestaurant={selectedRestaurant}
              currentDateTime={currentDateTime}
              staffInfo={staffInfo}
              onLogout={handleLogout}
              errorMessage={errorMessage}
              loadingTables={loadingTables}
              tables={tables}
              tableStatusConfig={tableStatusConfig}
              selectedRegion={selectedRegion}
              selectedDate={selectedDate}
              onRegionChange={handleRegionChange}
              onRestaurantChange={handleRestaurantChange}
              onDateChange={handleDateChange}
              onTableClick={handleTableClick}
              onRefreshTables={handleRefreshTables}
              getUniqueRegions={getUniqueRegions}
              getRestaurantsByRegion={getRestaurantsByRegion}
              showWarning={showWarning}
            />
          )}
          {currentPage === 'invoice' && (
            <InvoicePage
              selectedRestaurant={selectedRestaurant}
              currentDateTime={currentDateTime}
              staffInfo={staffInfo}
              onLogout={handleLogout}
              selectedOrder={selectedOrder}
              orders={orders}
              onRefreshOrders={handleRefreshOrders}
              onUpdateOrderStatus={updateOrderStatus}
            />
          )}
          {currentPage === 'notifications' && (
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      <Building className="w-6 h-6" />
                      {selectedRestaurant?.name || 'Hệ thống nhà hàng'}
                    </h1>
                    <p className="text-blue-100 text-sm mt-1">
                      {currentDateTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-blue-100">Nhân viên</p>
                      <p className="font-semibold">{staffInfo?.name || staffInfo?.username || 'Staff'}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NotificationsPage />
              </div>
            </div>
          )}
        </div>
      </div>

      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pendingCount={pendingCount}
        orders={orders}
      />
      
      <TableModal
        showTableModal={showTableModal}
        selectedTable={selectedTable}
        selectedDate={selectedDate}
        selectedRestaurant={selectedRestaurant}
        tableStatusConfig={tableStatusConfig}
        orders={orders}
        onClose={handleTableModalClose}
        onChangeTableStatus={changeTableStatus}
        onRefreshOrdersForTable={refreshOrdersForTable}
        onUpdateBookingStatus={updateBookingStatus}
        onCreateBookingForTable={handleCreateBookingForTable}
        onLoadTableBookingInfo={handleLoadTableBookingInfo}
      />
      
      <OrderDetailModal
        showOrderDetailModal={showOrderDetailModal}
        selectedOrder={selectedOrder}
        statusConfig={statusConfig}
        onClose={handleOrderDetailModalClose}
        onUpdateOrderStatus={updateOrderStatus}
        onGoToInvoice={handleGoToInvoice}
      />
    </div>
  );
};

export default staffPage;
