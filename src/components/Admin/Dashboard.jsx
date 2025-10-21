import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, message, Select, Space, DatePicker, Typography } from "antd";
import { Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import {
  getTables,
  getMenuItems,
  getBookingsByRestaurant,
  getFeedbackStats,
  getRestaurants,
  getRevenueReport,
} from "../../api/api";

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

  // ✅ Lấy danh sách chi nhánh theo miền
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!region) {
        setRestaurants([]);
        setSelectedRestaurant("");
        return;
      }
    
      try {
        console.log("🔍 Đang tải chi nhánh cho miền:", region);
        const data = await getRestaurants({ region });

        // Nếu không có dữ liệu mới (304 Not Modified), không cập nhật trạng thái
        if (data === null) {
          console.log("✅ Không có dữ liệu chi nhánh mới.");
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
          console.log("✅ Khớp lại chi nhánh:", matchedRestaurant.name);
        } else {
          setSelectedRestaurant("");
          setError("⚠️ Vui lòng chọn chi nhánh để xem báo cáo.");
          console.log("⚠️ Không tìm thấy chi nhánh phù hợp trong miền", region);
        }
      } catch (err) {
        console.error("🚨 Lỗi tải danh sách chi nhánh:", err);
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
    const token = localStorage.getItem("token");
    const restaurantId = selectedRestaurant || localStorage.getItem("restaurantId");

    // 🛑 Nếu chưa chọn chi nhánh → hiển thị cảnh báo, không gọi API
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
      return;
    }

    // 🕒 Tạo query thời gian dựa vào timeRange
    const query = buildTimeQuery(timeRange, customRange);
    const today = dayjs().format("YYYY-MM-DD");

    // 🧩 Gọi song song các API cần thiết
    const [tables, foods, bookings, feedbackStats, revenueReport] = await Promise.all([
      getTables({ restaurantId }, token),
      getMenuItems({}, token),
      getBookingsByRestaurant(restaurantId, { date: today }, token),
      getFeedbackStats(token),
      getRevenueReport({ restaurantId, ...query }, token),
    ]);

    // 💰 Doanh thu tổng
    const revenue = revenueReport?.totalRevenue || 0;

    // 📊 Cập nhật thống kê
    setStats({
      tables: tables?.length || 0,
      foods: foods?.length || 0,
      revenue,
      feedbackTotal: feedbackStats?.totalFeedbacks || 0,
      avgRating: feedbackStats?.averageRating || 0,
      ratingCounts: feedbackStats?.ratingCounts || {},
    });
  } catch (err) {
    console.error("Dashboard load error:", err);

    // 💬 Xử lý lỗi BE trả về (ví dụ 400 khi chưa chọn chi nhánh)
    if (err.response?.status === 400 && err.response?.data?.message) {
      message.warning(err.response.data.message);
    } else {
      message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    }

    // Reset lại stats để UI không hiển thị dữ liệu cũ
    setStats({
      tables: 0,
      foods: 0,
      revenue: 0,
      feedbackTotal: 0,
      avgRating: 0,
      ratingCounts: {},
    });
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
          <Card title="📊 Phân bố đánh giá sao" className="shadow">
            {ratingData.length > 0 ? <Pie {...pieConfig} /> : <p>Chưa có dữ liệu đánh giá.</p>}
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow" title="💬 Tổng số Feedback">
            <Statistic value={stats.feedbackTotal} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;