import React, { useState } from 'react';
import { RefreshCw, Printer, CheckCircle, Wallet, CreditCard, QrCode } from 'lucide-react';
import HeaderComponent from './HeaderComponent';
import { useNotification } from '../../hooks/useNotification.js';

const InvoicePage = ({
  selectedRestaurant,
  currentDateTime,
  staffInfo,
  onLogout,
  selectedOrder,
  orders,
  onRefreshOrders,
  onUpdateOrderStatus
}) => {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const { showSuccess, showError } = useNotification();
  
  const order = selectedOrder || orders[0] || {};
  const subtotal = selectedOrder?.total ?? 0;
  const finalTotal = subtotal - discount;
  
  return (
    <div className="h-full flex flex-col">
      <HeaderComponent 
        selectedRestaurant={selectedRestaurant}
        currentDateTime={currentDateTime}
        staffInfo={staffInfo}
        onLogout={onLogout}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Hóa đơn thanh toán</h2>
        <button 
          onClick={onRefreshOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>
      
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
              {order.items?.map((item, idx) => (
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
                    await onUpdateOrderStatus(order.id, 'completed');
                    showSuccess(
                      'Thanh toán thành công',
                      `Đơn hàng #${order.id} đã được thanh toán thành công. Cảm ơn quý khách!`
                    );
                  } catch (e) {
                    showError(
                      'Thanh toán thất bại',
                      e.message || 'Chúng tôi không thể xử lý thanh toán lúc này. Vui lòng thử lại sau.'
                    );
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

export default InvoicePage;
