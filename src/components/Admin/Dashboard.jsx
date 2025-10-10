import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, message } from "antd";
import { getTables, getMenuItems, getBookingsByDate } from "../../api/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    tables: 0,
    foods: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const tables = await getTables({}, token);
        const foods = await getMenuItems({}, token);
        const todayBookings = await getBookingsByDate(
          { date: new Date().toISOString().split("T")[0] },
          token
        );

        // Tính doanh thu giả định
        const revenue = todayBookings.reduce((sum, b) => sum + (b.total || 0), 0);

        setStats({
          tables: tables.length || 0,
          foods: foods.length || 0,
          revenue,
        });
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu dashboard");
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card className="shadow">
            <Statistic title="Tổng số bàn" value={stats.tables} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow">
            <Statistic title="Tổng số món ăn" value={stats.foods} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow">
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.revenue}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
