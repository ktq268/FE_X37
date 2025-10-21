import { Tabs, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import DashboardTab from "../components/Admin/Dashboard";
import FoodTab from "../components/Admin/FoodManagement";
import TableTab from "../components/Admin/TableManagement";

const AdminPage = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ⚡ Cấu hình các tab bằng cú pháp mới (items)
  const tabItems = [
    {
      key: "1",
      label: "📊 Dashboard",
      children: <DashboardTab />,
    },
    {
      key: "2",
      label: "🍽️ Quản lý món ăn",
      children: <FoodTab />,
    },
    {
      key: "3",
      label: "🪑 Quản lý bàn",
      children: <TableTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Trang quản trị hệ thống
          </h1>
          <p className="text-gray-500">
            Quản lý toàn bộ hoạt động nhà hàng.
          </p>
        </div>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>

      {/* Tabs bên trái */}
      <div className="bg-white shadow rounded-lg p-4">
        <Tabs tabPosition="left" defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
};

export default AdminPage;
