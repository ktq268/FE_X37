import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, message, Select, Space, DatePicker, Typography, Rate, List, Empty, Spin } from "antd";
import { Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import {
  getTables,
  getMenuItems,
  getBookingsByRestaurant,
  getFeedbackStats,
  getRestaurants,
  getRevenueReport,
  getFeedbacks,
  staffGetOrders,
} from "../../api/api";
import { getDashboardMetrics } from "../../api/api";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Dashboard = () => {
  const [region, setRegion] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(localStorage.getItem("restaurantId") || "");
  const [timeRange, setTimeRange] = useState("today");
  const [customRange, setCustomRange] = useState([]);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    tables: 0,
    foods: 0,
    revenue: 0,
    feedbackTotal: 0,
    avgRating: 0,
    ratingCounts: {},
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!region) {
        setRestaurants([]);
        setSelectedRestaurant("");
        return;
      }
    
      try {
        const data = await getRestaurants({ region });

        // Nếu không có dữ liệu mới (304 Not Modified), không cập nhật trạng thái
        if (data === null) {
          return;
        }
      
        // 🧩 Kiểm tra dữ liệu hợp lệ
        const validRestaurants = Array.isArray(data)
          ? data.filter((r) => r && r._id && r.name)
          : [];
      
        setRestaurants(validRestaurants);
      
        // 🪪 Kiểm tra xem localStorage có chi nhánh cũ không
        const savedId = localStorage.getItem("restaurantId");
        const matchedRestaurant = validRestaurants.find((r) => r._id === savedId);
      
        if (matchedRestaurant) {
          setSelectedRestaurant(savedId);
          setError("");
        } else {
          setSelectedRestaurant("");
          setError("⚠️ Vui lòng chọn chi nhánh để xem báo cáo.");
        }
      } catch (err) {
        message.error("Không thể tải danh sách chi nhánh");
        setRestaurants([]);
        setSelectedRestaurant("");
      }
    };
  
    fetchRestaurants();
  }, [region]);
  


  // ✅ Khi chọn chi nhánh hoặc thay đổi thời gian thì tải dữ liệu
  useEffect(() => {
    if (!selectedRestaurant) {
      setError("⚠️ Vui lòng chọn chi nhánh để xem báo cáo.");
      return;
    }
    setError("");
    localStorage.setItem("restaurantId", selectedRestaurant);
    fetchData();
  }, [selectedRestaurant, timeRange, customRange]);

  // ✅ Tạo query theo thời gian
  const buildTimeQuery = (range, customRange) => {
    switch (range) {
      case "today":
        return { range: "today" };
      case "yesterday":
        return { range: "yesterday" };
      case "week":
        return { range: "week" };
      case "lastWeek":
        return { range: "lastWeek" };
      case "month":
        return { range: "month" };
      case "lastMonth":
        return { range: "lastMonth" };
      case "custom":
        if (customRange.length === 2) {
          return {
            range: "custom",
            from: customRange[0].format("YYYY-MM-DD"),
            to: customRange[1].format("YYYY-MM-DD"),
          };
        }
        return {};
      default:
        return { range: "today" };
    }
  };

  // ✅ Hàm load dữ liệu tổng hợp
  const fetchData = async () => {
    try {
      setFeedbackLoading(true);
      const token = localStorage.getItem("token");
      const restaurantId = selectedRestaurant || localStorage.getItem("restaurantId");

      if (!restaurantId || restaurantId === "none") {
        message.warning("Vui lòng chọn chi nhánh để xem báo cáo doanh thu.");
        setStats({
          tables: 0,
          foods: 0,
          revenue: 0,
          feedbackTotal: 0,
          avgRating: 0,
          ratingCounts: {},
        });
        setFeedbacks([]);
        return;
      }

      const timeQuery = buildTimeQuery(timeRange, customRange);

      // Gọi song song: thống kê feedback + metrics + orders
      const [feedbackStatsRes, metricsRes, ordersRes] = await Promise.all([
        getFeedbackStats(restaurantId, token),
        getDashboardMetrics(restaurantId, token),
        staffGetOrders({ restaurantId }, token),
      ]);

      // Cập nhật stats như hiện tại
      setStats((prev) => ({
        ...prev,
        tables: metricsRes.tables || 0,
        foods: metricsRes.foods || 0,
        revenue: metricsRes.revenueFromOrders || 0,
        feedbackTotal: feedbackStatsRes.reduce((acc, s) => acc + (s.count || 0), 0),
        avgRating: (() => {
          const total = feedbackStatsRes.reduce((acc, s) => acc + (s.count || 0), 0);
          const weighted = feedbackStatsRes.reduce((sum, s) => sum + (s._id || 0) * (s.count || 0), 0);
          return Number(((weighted / (total || 1))).toFixed(2));
        })(),
        ratingCounts: feedbackStatsRes.reduce((obj, s) => {
          obj[s._id] = s.count;
          return obj;
        }, {}),
      }));

      // Trích xuất feedback từ orders (order.feedback)
      const rawOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
      const feedbacksFromOrders = rawOrders
        .filter((o) => o?.feedback && typeof o.feedback.rating === "number")
        .map((o) => ({
          rating: o.feedback.rating,
          comment: o.feedback.comment,
          createdAt: o.feedback.updatedAt || o.feedback.createdAt || o.updatedAt || o.createdAt,
          user: o.user,
          restaurant: o.restaurant,
          orderId: o._id,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFeedbacks(feedbacksFromOrders);
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      // 💬 Xử lý lỗi BE trả về (ví dụ 400 khi chưa chọn chi nhánh)
      if (err.response?.status === 400 && err.response?.data?.message) {
        message.warning(err.response.data.message);
      } else {
        message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      }

      // Reset lại stats và feedbacks để UI không hiển thị dữ liệu cũ
      setStats({
        tables: 0,
        foods: 0,
        revenue: 0,
        feedbackTotal: 0,
        avgRating: 0,
        ratingCounts: {},
      });
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  };


  // ✅ Chuẩn bị dữ liệu cho biểu đồ tròn
  const ratingData = Object.entries(stats.ratingCounts).map(([key, value]) => ({
    type: `${key} ⭐`,
    value,
  }));

  const pieConfig = {
    data: ratingData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: ({ type, percent }) => `${type}: ${(percent * 100).toFixed(1)}%`,
    },
    interactions: [{ type: "element-active" }],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard</h2>

      {/* 🔹 Bộ lọc chọn Miền + Chi nhánh + Thời gian */}
      <Space size="large" className="mb-6" wrap>
        <Select
          placeholder="Chọn Miền"
          value={region || undefined}
          onChange={(value) => {
            setRegion(value);
            setRestaurants([]);
            setSelectedRestaurant("");
          }}
          style={{ width: 180 }}>
          <Select.Option value="north">Miền Bắc</Select.Option>
          <Select.Option value="central">Miền Trung</Select.Option>
          <Select.Option value="south">Miền Nam</Select.Option>
        </Select>

        {/* 🔹 Chọn chi nhánh */}
        <Select
          placeholder="Chọn Chi nhánh"
          value={selectedRestaurant || undefined}
          onChange={(value) => setSelectedRestaurant(value)}
          style={{ width: 250 }}
          disabled={!region}
        >
          {restaurants.length > 0 ? (
            restaurants.map((r) => (
              <Select.Option key={r._id} value={r._id}>
                {r.name}
              </Select.Option>
            ))
          ) : (
            <Select.Option disabled>Chưa có chi nhánh trong miền này</Select.Option>
          )}
        </Select>


        <Select
          placeholder="Khoảng thời gian"
          value={timeRange}
          onChange={(value) => setTimeRange(value)}
          style={{ width: 180 }}
        >
          <Select.Option value="today">Hôm nay</Select.Option>
          <Select.Option value="yesterday">Hôm qua</Select.Option>
          <Select.Option value="week">Tuần này</Select.Option>
          <Select.Option value="lastWeek">Tuần trước</Select.Option>
          <Select.Option value="month">Tháng này</Select.Option>
          <Select.Option value="lastMonth">Tháng trước</Select.Option>
          <Select.Option value="custom">Tùy chỉnh</Select.Option>
        </Select>

        {timeRange === "custom" && (
          <RangePicker onChange={(dates) => setCustomRange(dates)} format="YYYY-MM-DD" />
        )}
      </Space>

      {/* ⚠️ Cảnh báo nếu chưa chọn chi nhánh */}
      {!selectedRestaurant && (
        <div
          style={{
            marginTop: 16,
            backgroundColor: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#ad8b00",
            fontWeight: 500,
            textAlign: "center",
            width: "fit-content",
          }}
        >
          ⚠️ Vui lòng chọn chi nhánh để xem dữ liệu thống kê.
        </div>
      )}


      {/* 🔹 Thống kê tổng quan */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow">
            <Statistic title="Tổng số bàn" value={stats.tables} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow">
            <Statistic title="Tổng số món ăn" value={stats.foods} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow">
            <Statistic title="Doanh thu" value={stats.revenue.toLocaleString("vi-VN")} suffix="đ" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow">
            <Statistic
              title="Điểm trung bình đánh giá"
              value={stats.avgRating}
              precision={1}
              suffix="⭐"
            />
          </Card>
        </Col>
      </Row>

      {/* 🔹 Biểu đồ và feedback */}
      <Row gutter={16} className="mt-8">
        <Col span={12}>
          <Card title="📊 Phân bối đánh giá sao" className="shadow">
            {ratingData.length > 0 ? <Pie {...pieConfig} /> : <p>Chưa có dữ liệu đánh giá.</p>}
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow" title="💬 Tổng số Feedback">
            <Statistic value={stats.feedbackTotal} />
          </Card>
        </Col>
      </Row>

      {/* 🔹 Danh sách feedback mới nhất (order.feedback) */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="💬 Phản hồi mới nhất">
            {feedbackLoading ? (
              <Spin />
            ) : feedbacks.length === 0 ? (
              <Empty description="Chưa có phản hồi" />
            ) : (
              <List
                dataSource={feedbacks.slice(0, 10)}
                renderItem={(item) => {
                  const created = item.createdAt
                    ? new Date(item.createdAt).toLocaleString("vi-VN")
                    : "";
                  // Thêm fallback an toàn hơn
                  const userName =
                    item.user?.name ||
                    item.user?.fullName ||
                    (item.user ? `User ID: ${item.user}`: 'Người dùng ẩn danh');
                  const restaurantName =
                    item.restaurant?.name || item.restaurantName || "";
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span>{userName}</span>
                            {restaurantName ? (
                              <span style={{ color: "#888" }}>· {restaurantName}</span>
                            ) : null}
                            <span style={{ color: "#888" }}>· {created}</span>
                          </div>
                        }
                        description={
                          <div>
                            <Rate disabled value={item.rating} />
                            <div style={{ marginTop: 4 }}>{item.comment}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;