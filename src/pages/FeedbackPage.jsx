import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { sendOrderFeedback } from "../api/api.js";

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

 async function handleSubmit(e) {
  e.preventDefault();
  if (!orderId) {
    alert("Không có orderId để gửi feedback.");
    return;
  }

  setLoading(true);
  try {
    await sendOrderFeedback(
      orderId,
      { rating: Number(rating), comment },
      token
    );
    alert("Cảm ơn! Feedback đã được gửi.");
    navigate("/"); // quay lại trang chính
  } catch (err) {
    console.error("Feedback error:", err);
    alert(err.message || "Gửi feedback thất bại");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Phản hồi đơn hàng</h1>
      <p className="text-sm text-gray-600 mb-4">
        Mã đơn: <strong>{orderId}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Đánh giá (1-5)</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value={5}>5 - Rất tốt</option>
            <option value={4}>4 - Tốt</option>
            <option value={3}>3 - Trung bình</option>
            <option value={2}>2 - Kém</option>
            <option value={1}>1 - Rất kém</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Nhận xét</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full border rounded px-3 py-2"
            placeholder="Ghi lời nhắn cho nhà hàng..."
          ></textarea>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Đang gửi..." : "Gửi phản hồi"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Quay lại trang chính
          </button>
        </div>
      </form>
    </div>
  );
}
