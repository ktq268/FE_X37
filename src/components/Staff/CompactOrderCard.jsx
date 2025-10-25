import React from 'react';
import { Eye } from 'lucide-react';

const CompactOrderCard = ({ order, statusConfig, onOrderClick }) => {
  if (!order) return null;
  
  const config = statusConfig[order.status] || statusConfig['pending'];
  const items = order.items || [];
  const total = order.total || 0;
  
  return (
    <div 
      onClick={() => onOrderClick(order)}
      className={`border-2 ${config.borderColor} rounded-lg p-3 ${config.bgColor} hover:shadow-lg transition-all cursor-pointer min-w-[280px]`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-base">#{order.id || 'N/A'}</h3>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span>Bàn {order.tableNumber || 'N/A'}</span>
            <span>•</span>
            <span>{order.createdAt || 'N/A'}</span>
          </div>
        </div>
        <div className={`${config.color} text-white px-2 py-1 rounded text-xs font-medium`}>
          {config.label}
        </div>
      </div>
      
      <div className="text-xs mb-2 space-y-1">
        {items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="truncate">{item.quantity || 0}x {item.name || 'N/A'}</span>
          </div>
        ))}
        {items.length > 2 && (
          <div className="text-gray-500 italic">+{items.length - 2} món khác</div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <div className="font-bold text-sm">{total.toLocaleString()}đ</div>
        <Eye size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default CompactOrderCard;
