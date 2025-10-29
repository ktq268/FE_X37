import React, { useState } from 'react';
import { RefreshCw, Printer, CheckCircle, Wallet, CreditCard, QrCode } from 'lucide-react';
import QRCode from "react-qr-code";
import HeaderComponent from './HeaderComponent';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification.js';
import { createInvoiceFromOrder, exportInvoicePdf } from '../../api/api.js';

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
  const navigate = useNavigate();
  
  const order = selectedOrder || orders[0] || {};
  const subtotal = selectedOrder?.total ?? 0;
  const finalTotal = subtotal - discount;

  const handlePrintInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Lỗi", "Bạn cần đăng nhập lại để in hóa đơn.");
        return;
      }

      // 1️⃣ Tạo hóa đơn mới (nếu chưa có)
      console.log("📝 Creating invoice for order:", orderId);
      const createdInvoice = await createInvoiceFromOrder(orderId, token);
      const invoiceId = createdInvoice?.invoice?._id || createdInvoice?._id;

      if (!invoiceId) {
        showError("Lỗi", "Không thể tạo hóa đơn. Vui lòng thử lại.");
        return;
      }

      console.log("📄 Invoice created with ID:", invoiceId);

      // 2️⃣ Xuất PDF (gọi API 1 lần duy nhất)
      console.log("📥 Fetching PDF export...");
      const blob = await exportInvoicePdf(invoiceId, token);

      // Debug: Check blob type
      console.log("✅ Blob received - Type:", blob.type, "Size:", blob.size);

      if (!blob || blob.size === 0) {
        showError("Lỗi", "File PDF không hợp lệ hoặc rỗng.");
        return;
      }

      // 3️⃣ Tạo URL từ Blob và download
      const url = window.URL.createObjectURL(blob);
      console.log("🔗 ObjectURL created:", url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log("🧹 ObjectURL revoked");
      }, 100);

      showSuccess("Thành công", "Hóa đơn đã được tải xuống!");
    } catch (error) {
      console.error("❌ Error printing invoice:", error);
      showError(
        "Lỗi in hóa đơn",
        error.message || "Không thể in hóa đơn. Vui lòng thử lại!"
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

            {paymentMethod === 'qr' && (
            <div className="relative bg-white border rounded-lg p-4 mt-3 flex flex-col items-center">
              <button
                onClick={() => setPaymentMethod('')}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                ✕
              </button>

              <h4 className="text-sm font-semibold mb-2 text-gray-700">
                Quét mã để thanh toán
              </h4>

              <div className="bg-white p-3 border rounded-lg">
                <QRCode
                  value="MAISON DE FLAVORS - STK 0123456789 - Vietcombank"
                  size={150}
                />
              </div>

              <p className="mt-3 text-xs text-gray-600 text-center">
                <span className="font-medium">Maison De Flavors</span><br />
                STK: <span className="font-semibold">0123456789</span><br />
                Ngân hàng: Vietcombank
              </p>
            </div>
            )}

            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handlePrintInvoice(selectedOrder._id)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition text-sm">
                <Printer size={16} />
                In bill
              </button>
              <button
                onClick={async () => {
                  try {
                    const orderId = selectedOrder?._id || order?._id || order?.id;
                    await onUpdateOrderStatus(orderId, 'completed');
                    showSuccess(
                      'Thanh toán thành công',
                      `Đơn hàng #${orderId} đã được thanh toán thành công. Cảm ơn quý khách!`
                    );
                    // Sau khi thanh toán thành công, chuyển sang trang phản hồi và truyền orderId
                    navigate(`/feedback?orderId=${orderId}`);
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
