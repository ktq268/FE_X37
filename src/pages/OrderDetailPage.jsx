import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { getOrderDetail } from "../api/api";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getOrderDetail(orderId, token);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng</h1>
        {!token ? (
          <div>Vui lòng đăng nhập để xem chi tiết đơn hàng.</div>
        ) : loading ? (
          <div>Đang tải...</div>
        ) : !order ? (
          <div>Không tìm thấy đơn hàng.</div>
        ) : (
          <div className="bg-white p-4">
            <div className="mb-4">
              <div className="font-semibold">Mã đơn: {order._id}</div>
              <div className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">Trạng thái: {order.status}</div>
            </div>
            <div className="divide-y">
              {(order.items || []).map((it) => (
                <div
                  key={it.menuItemId}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium">
                      {it.menuItem?.name || it.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      SL: {it.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {(it.price || 0).toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <div className="text-lg font-bold">
                Tổng: {(order.total || 0).toLocaleString("vi-VN")} VNĐ
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
