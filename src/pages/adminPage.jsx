import { Tabs, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import DashboardTab from "../components/Admin/Dashboard";
import FoodTab from "../components/Admin/FoodManagement";
import TableTab from "../components/Admin/TableManagement";

const { TabPane } = Tabs;

const AdminPage = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trang quản trị hệ thống</h1>
          <p className="text-gray-500">Quản lý toàn bộ hoạt động nhà hàng.</p>
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
        <Tabs tabPosition="left" defaultActiveKey="1">
          <TabPane tab="📊 Dashboard" key="1">
            <DashboardTab />
          </TabPane>

          <TabPane tab="🍽️ Quản lý món ăn" key="2">
            <FoodTab />
          </TabPane>

          <TabPane tab="🪑 Quản lý bàn" key="3">
            <TableTab />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
