import React, { useState } from 'react';
import { X } from 'lucide-react';

const OrderDetailModal = ({
  showOrderDetailModal,
  selectedOrder,
  statusConfig,
  onClose,
  onUpdateOrderStatus,
  onGoToInvoice
}) => {
  if (!showOrderDetailModal || !selectedOrder) return null;

  
  const config = statusConfig[selectedOrder.status];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Chi tiết Order #{selectedOrder.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
              {selectedOrder.items?.map((item, idx) => (
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
                    onUpdateOrderStatus(selectedOrder.id || selectedOrder._id, 'preparing');
                    onClose();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Xác nhận
                </button>
              )}
              {selectedOrder.status === 'preparing' && (
                <button 
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrder.id || selectedOrder._id, 'served');
                    onClose();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Đã phục vụ
                </button>
              )}
              {selectedOrder.status === 'served' && (
                <button 
                  onClick={() => {
                    onClose();
                    onGoToInvoice();
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


  // Small helper button component that performs an async action and closes modal on success
  function AsyncActionButton({ label, className = '', onAction, onClose }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
      if (loading) return;
      try {
        setLoading(true);
        const result = await onAction();
        // If action returns true-ish, close modal
        if (result !== false) {
          if (typeof onClose === 'function') onClose();
        }
      } catch (err) {
        console.error('AsyncActionButton error:', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <button onClick={handleClick} disabled={loading} className={`${className} ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
        {loading ? 'Đang xử lý...' : label}
      </button>
    );
  }
export default OrderDetailModal;
