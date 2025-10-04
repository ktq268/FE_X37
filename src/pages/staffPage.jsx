import React, { useState, useEffect } from 'react';
import { getTables, updateTableStatusById, getBookingsByTable, updateBookingStatus, getPendingBookings } from '../api/api.js';
import { Clock, Users, ChefHat, CheckCircle, AlertCircle, Printer, CreditCard, Wallet, QrCode, X, Filter, Lock, Unlock, Edit, Eye, Bell } from 'lucide-react';
import NotificationsPage from './NotificationsPage.jsx';

const staffPage = () => {
  const [currentPage, setCurrentPage] = useState('orders');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTableModal, setShowTableModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  
  const [orders, setOrders] = useState([]);

  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentOrdersTable, setCurrentOrdersTable] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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

  const refreshTables = async (query = {}) => {
    setLoadingTables(true);
    setErrorMessage('');
    try {
      console.log('Fetching tables with query:', query, 'token:', token ? 'present' : 'missing');
      const data = await getTables(query, token);
      console.log('Tables API response:', data);
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

  const refreshOrdersForTable = async (table) => {
    if (!table) return;
    setLoadingOrders(true);
    setErrorMessage('');
    try {
      const res = await getBookingsByTable(table.id || table._id || table.tableNumber, {}, token);
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
    refreshTables({});
  }, []);

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const beStatus = feToBeOrderStatus(newStatus);
      await updateBookingStatus(order.bookingId || orderId, beStatus, token);
      await refreshOrdersForTable(currentOrdersTable);
    } catch (e) {
      alert(e.message || 'Không cập nhật được trạng thái order');
    }
  };

  const changeTableStatus = async (tableNumber, newStatus, customerInfo = null) => {
    try {
      // Tìm bàn theo số bàn
      const table = tables.find(t => String(t.tableNumber) === String(tableNumber));
      if (!table) {
        throw new Error(`Không tìm thấy bàn số ${tableNumber}`);
      }
      
      console.log('Changing table status:', { tableNumber, newStatus, tableId: table.id, table });
      
      // Kiểm tra table.id có tồn tại không
      if (!table.id) {
        throw new Error(`Table ID không tồn tại cho bàn số ${tableNumber}`);
      }
      
      // Sử dụng id của bàn để cập nhật
      await updateTableStatusById(table.id, newStatus, token);
      
      // Refresh lại danh sách bàn
      await refreshTables({});
      
      // Nếu đang xem orders của bàn này thì refresh lại orders
      if (currentOrdersTable && String(currentOrdersTable.tableNumber) === String(tableNumber)) {
        await refreshOrdersForTable(table);
      }
    } catch (e) {
      alert(e.message || 'Không cập nhật được trạng thái bàn');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const CompactOrderCard = ({ order }) => {
    const config = statusConfig[order.status];
    
    return (
      <div 
        onClick={() => {
          setSelectedOrder(order);
          setShowOrderDetailModal(true);
        }}
        className={`border-2 ${config.borderColor} rounded-lg p-3 ${config.bgColor} hover:shadow-lg transition-all cursor-pointer min-w-[280px]`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-base">#{order.id}</h3>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <span>Bàn {order.tableNumber}</span>
              <span>•</span>
              <span>{order.createdAt}</span>
            </div>
          </div>
          <div className={`${config.color} text-white px-2 py-1 rounded text-xs font-medium`}>
            {config.label}
          </div>
        </div>
        
        <div className="text-xs mb-2 space-y-1">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="truncate">{item.quantity}x {item.name}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-gray-500 italic">+{order.items.length - 2} món khác</div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="font-bold text-sm">{order.total.toLocaleString()}đ</div>
          <Eye size={16} className="text-gray-400" />
        </div>
      </div>
    );
  };

  const OrdersPage = () => (
    <div className="h-full flex flex-col">
      {errorMessage && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Order</h2>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm bg-white"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="preparing">Đang chế biến</option>
          <option value="served">Đã phục vụ</option>
          <option value="completed">Hoàn tất</option>
        </select>
      </div>
      
      {loadingOrders ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Đang tải orders...</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredOrders.length === 0 ? (
            <div className="text-gray-500 text-sm">Không có order</div>
          ) : (
            filteredOrders.map(order => (
              <CompactOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}
    </div>
  );

  const TablesPage = () => (
    <div className="h-full flex flex-col">
      {errorMessage && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Quản lý Bàn</h2>
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
                  onClick={async () => {
                    setSelectedTable(table);
                    setShowTableModal(true);
                    setCurrentOrdersTable(table);
                    await refreshOrdersForTable(table);
                  }}
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
                  
                  {table.orderId && (
                    <div className="text-xs text-purple-600 font-medium mt-1">#{table.orderId}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const InvoicePage = () => {
    const order = selectedOrder || orders[0] || {};
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    
    const subtotal = order.total;
    const finalTotal = subtotal - discount;
    
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Hóa đơn thanh toán</h2>
        
        <div className="grid md:grid-cols-2 gap-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-3 text-sm">Thông tin Order</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã order:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-medium">{order.customerName || 'Khách lẻ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bàn số:</span>
                  <span className="font-medium">{order.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">{order.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-3 text-sm">Danh sách món</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs pb-2 border-b">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.note && <div className="text-gray-500">{item.note}</div>}
                      <div className="text-gray-600">{item.price.toLocaleString()}đ x {item.quantity}</div>
                    </div>
                    <div className="font-bold">{(item.price * item.quantity).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-sm">Thanh toán</h3>
              
              <div className="space-y-2 mb-3 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold">{subtotal.toLocaleString()}đ</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Giảm giá:</span>
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24 text-right text-sm"
                    placeholder="0"
                  />
                </div>
                
                <div className="border-t-2 border-blue-300 pt-2 flex justify-between text-lg">
                  <span className="font-bold">Tổng:</span>
                  <span className="font-bold text-blue-600">{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block font-medium mb-2 text-xs">Phương thức:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-lg border-2 transition text-xs ${
                      paymentMethod === 'cash' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Wallet className="mx-auto mb-1" size={18} />
                    <div>Tiền mặt</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-lg border-2 transition text-xs ${
                      paymentMethod === 'card' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <CreditCard className="mx-auto mb-1" size={18} />
                    <div>Thẻ</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-2 rounded-lg border-2 transition text-xs ${
                      paymentMethod === 'qr' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <QrCode className="mx-auto mb-1" size={18} />
                    <div>QR</div>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition text-sm">
                  <Printer size={16} />
                  In bill
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await updateOrderStatus(order.id, 'completed');
                      alert('Thanh toán thành công!');
                    } catch (e) {
                      alert(e.message || 'Thanh toán thất bại');
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition text-sm"
                >
                  <CheckCircle size={16} />
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TableModal = () => {
    if (!showTableModal || !selectedTable) return null;
    const [customerName, setCustomerName] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="border-b p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Bàn số {selectedTable.tableNumber}</h3>
            <button onClick={() => setShowTableModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Trạng thái hiện tại:</div>
              <div className="font-bold text-lg">{(tableStatusConfig[selectedTable.status] || tableStatusConfig['available']).label}</div>
              
              {/* Hiển thị thông tin booking chi tiết */}
              {selectedTable.status === 'reserved' && selectedTable.blockedBy && (
                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="text-sm font-medium text-blue-800">📋 Thông tin đặt bàn:</div>
                  <div className="text-sm text-blue-700">{selectedTable.blockedBy}</div>
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
            
            <div className="space-y-3">
              <h4 className="font-bold">Chuyển trạng thái:</h4>
              
              <button
                onClick={() => {
                  changeTableStatus(selectedTable.tableNumber, 'available');
                  setShowTableModal(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                disabled={selectedTable.status === 'available'}
              >
                <Unlock size={20} />
                Đặt trạng thái TRỐNG
              </button>
              
              <button
                onClick={() => {
                  changeTableStatus(selectedTable.tableNumber, 'occupied');
                  setShowTableModal(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                disabled={selectedTable.status === 'occupied' || selectedTable.status === 'blocked'}
              >
                <Users size={20} />
                Khách đang dùng
              </button>
              
              <div className="border-t pt-3">
                <h4 className="font-bold mb-2 text-blue-600">📋 Đặt bàn cho khách</h4>
                <p className="text-sm text-gray-600 mb-3">Sử dụng khi khách gọi điện hoặc đến trực tiếp đặt bàn</p>
                <input
                  type="text"
                  placeholder="Tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-2"
                />
                <input
                  type="time"
                  placeholder="Giờ đặt"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-2"
                />
                <button
                  onClick={() => {
                    if (customerName && reservationTime) {
                      changeTableStatus(selectedTable.tableNumber, 'reserved', `${customerName} - ${reservationTime}`);
                      setShowTableModal(false);
                      setCustomerName('');
                      setReservationTime('');
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  disabled={!customerName || !reservationTime || selectedTable.status === 'blocked'}
                >
                  <CheckCircle size={20} />
                  Đặt bàn cho khách
                </button>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-bold mb-2 text-yellow-600">🔒 Khóa bàn tạm thời</h4>
                <p className="text-sm text-gray-600 mb-3">Sử dụng khi bàn cần bảo trì hoặc có vấn đề</p>
                <button
                  onClick={() => {
                    changeTableStatus(selectedTable.tableNumber, 'blocked', 'Bảo trì');
                    setShowTableModal(false);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  disabled={selectedTable.status === 'blocked'}
                >
                  <Lock size={20} />
                  Khóa bàn tạm thời
                </button>
              </div>
              
              {selectedTable.status === 'blocked' && (
                <div className="border-t pt-3">
                  <h4 className="font-bold mb-2 text-red-600">Bàn đã bị khóa</h4>
                  <button
                    onClick={() => {
                      changeTableStatus(selectedTable.tableNumber, 'available');
                      setShowTableModal(false);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Unlock size={20} />
                    Mở khóa bàn
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderDetailModal = () => {
    if (!showOrderDetailModal || !selectedOrder) return null;
    const config = statusConfig[selectedOrder.status];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Chi tiết Order #{selectedOrder.id}</h3>
            <button onClick={() => setShowOrderDetailModal(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Khách hàng:</span>
                <div className="font-medium">{selectedOrder.customerName || 'Khách lẻ'}</div>
              </div>
              <div>
                <span className="text-gray-600">Bàn số:</span>
                <div className="font-medium">Bàn {selectedOrder.tableNumber}</div>
              </div>
              <div>
                <span className="text-gray-600">Thời gian:</span>
                <div className="font-medium">{selectedOrder.createdAt}</div>
              </div>
              <div>
                <span className="text-gray-600">Trạng thái:</span>
                <div className={`inline-block ${config.color} text-white px-3 py-1 rounded-full text-xs font-medium mt-1`}>
                  {config.label}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-bold mb-3">Danh sách món:</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.note && <div className="text-sm text-gray-500 italic">{item.note}</div>}
                      <div className="text-sm text-gray-600 mt-1">{item.price.toLocaleString()}đ x {item.quantity}</div>
                    </div>
                    <div className="font-bold">{(item.price * item.quantity).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedOrder.note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="font-medium text-sm mb-1">Ghi chú:</div>
                <div className="text-sm">{selectedOrder.note}</div>
              </div>
            )}
            
            <div className="border-t pt-4 flex justify-between items-center">
              <div className="text-2xl font-bold">Tổng: {selectedOrder.total.toLocaleString()}đ</div>
              <div className="flex gap-2">
                {selectedOrder.status === 'pending' && (
                  <button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'preparing');
                      setShowOrderDetailModal(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Xác nhận
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'served');
                      setShowOrderDetailModal(false);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Đã phục vụ
                  </button>
                )}
                {selectedOrder.status === 'served' && (
                  <button 
                    onClick={() => {
                      setShowOrderDetailModal(false);
                      setCurrentPage('invoice');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Thanh toán
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg shadow-lg h-full p-4 overflow-y-auto">
          {currentPage === 'orders' && <OrdersPage />}
          {currentPage === 'tables' && <TablesPage />}
          {currentPage === 'invoice' && <InvoicePage />}
          {currentPage === 'notifications' && <NotificationsPage />}
        </div>
      </div>

      <nav className="bg-white border-t shadow-lg">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentPage('orders')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentPage === 'orders' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChefHat size={24} />
            <span className="text-xs font-medium">Orders</span>
          </button>
          <button
            onClick={() => setCurrentPage('tables')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentPage === 'tables' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={24} />
            <span className="text-xs font-medium">Bàn</span>
          </button>
          <button
            onClick={() => setCurrentPage('notifications')}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${
              currentPage === 'notifications' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell size={24} />
            <span className="text-xs font-medium">Thông báo</span>
          </button>
          <button
            onClick={() => {
              setSelectedOrder(orders[0]);
              setCurrentPage('invoice');
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
      
      <TableModal />
      <OrderDetailModal />
    </div>
  );
};

export default staffPage;
