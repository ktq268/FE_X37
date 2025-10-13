import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { getMyOrders } from "../api/api";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getMyOrders(token);
        setOrders(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
        {!token ? (
          <div>Vui lòng đăng nhập để xem đơn hàng.</div>
        ) : loading ? (
          <div>Đang tải...</div>
        ) : orders.length === 0 ? (
          <div>Chưa có đơn hàng.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="block bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">Mã đơn: {o._id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {(o.total || 0).toLocaleString("vi-VN")} VNĐ
                    </div>
                    <div className="text-sm text-gray-600">{o.status}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
