import React from 'react';
import { Building, LogOut } from 'lucide-react';

const HeaderComponent = ({ 
  selectedRestaurant, 
  currentDateTime, 
  staffInfo, 
  onLogout 
}) => {
  return (
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
            onClick={onLogout}
            className="flex items-center bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
