import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { sendFeedback, getOrderDetail } from "../api/api.js";
import { Star, Send, Home, CheckCircle } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useNotification } from "../hooks/useNotification.js";

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Kiểm tra xem đơn hàng đã có feedback chưa
  useEffect(() => {
    const checkOrderFeedback = async () => {
      if (!orderId || !token) {
        setOrderLoading(false);
        return;
      }

      try {
        const order = await getOrderDetail(orderId, token);
        if (order.feedback) {
          setExistingFeedback(order.feedback);
        }
      } catch (err) {
        console.error("Error checking order feedback:", err);
      } finally {
        setOrderLoading(false);
      }
    };

    checkOrderFeedback();
  }, [orderId, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!orderId) {
      showError("Lỗi", "Không có mã đơn hàng để gửi phản hồi.");
      return;
    }

    setLoading(true);
    try {
      await sendFeedback(
        { orderId, rating: Number(rating), comment },
        token
      );
      setSubmitted(true);
      showSuccess("Thành công", "Cảm ơn quý khách! Phản hồi của bạn đã được gửi.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Feedback error:", err);
      // Nếu đơn hàng đã được đánh giá, hiển thị feedback hiện có thay vì báo lỗi
      if (err?.message?.includes("Đơn hàng này đã được đánh giá")) {
        try {
          const order = await getOrderDetail(orderId, token);
          if (order?.feedback) {
            setExistingFeedback(order.feedback);
          }
        } catch (fetchErr) {
          console.error("Fetch existing feedback error:", fetchErr);
        }
        // Không hiện toast lỗi cho trường hợp đã đánh giá
      } else {
        showError(
          "Lỗi gửi phản hồi",
          err.message || "Không thể gửi phản hồi. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Hiển thị loading khi đang kiểm tra đơn hàng
  if (orderLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-16 mt-20 flex items-center justify-center">
        {submitted ? (
          // Success State
          <div className="w-full max-w-md text-center animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4">
                  <CheckCircle size={64} className="text-orange-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Cảm ơn bạn!
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Phản hồi của quý khách về đơn hàng <span className="font-semibold text-orange-600">#{bookingId}</span> đã được ghi nhận.
              Chúng tôi sẽ cải thiện dịch vụ để phục vụ bạn tốt hơn.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Quay về trang chủ trong 3 giây...</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Home size={20} />
                Về trang chủ ngay
              </button>
            </div>
          </div>
        ) : existingFeedback ? (
          // Hiển thị feedback đã có
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4">
                  <CheckCircle size={64} className="text-green-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Đánh giá đã hoàn thành
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Bạn đã đánh giá đơn hàng <span className="font-semibold text-orange-600">#{orderId}</span>
            </p>
            
            {/* Hiển thị đánh giá hiện có */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    size={24}
                    className={value <= existingFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              {existingFeedback.comment && (
                <p className="text-gray-700 italic">"{existingFeedback.comment}"</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Đánh giá vào: {new Date(existingFeedback.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>
        ) : (
          // Feedback Form
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12 text-white text-center">
                <h1 className="text-4xl font-bold mb-2">Phản hồi của bạn</h1>
                <p className="text-orange-100 text-lg">
                  Đơn hàng <span className="font-semibold">#{bookingId}</span>
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Rating Section */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Đánh giá chất lượng dịch vụ
                  </label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="group transition-all duration-200 transform hover:scale-110"
                      >
                        <Star
                          size={48}
                          className={`transition-all duration-200 ${
                            value <= rating
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                              : "text-gray-300 group-hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-600">
                    {rating === 5 && "Tuyệt vời! 🎉"}
                    {rating === 4 && "Rất tốt! 👍"}
                    {rating === 3 && "Bình thường 😐"}
                    {rating === 2 && "Có thể cải thiện 😕"}
                    {rating === 1 && "Cần cải thiện nhiều 😞"}
                  </p>
                </div>

                {/* Comment Section */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Lời nhận xét của bạn
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
                    placeholder="Chia sẻ trải nghiệm của bạn... (Tùy chọn)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    disabled={loading}
                    className="py-3 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    {loading ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
                </div>
              </form>

              {/* Footer Info */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                ✨ Phản hồi của bạn rất quan trọng với chúng tôi
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
