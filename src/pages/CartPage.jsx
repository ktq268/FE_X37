import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useCart } from "../contexts/CartContext";
import { createOrderFromCart, getRestaurants } from "../api/api";
import { useNotification } from "../hooks/useNotification.js";
import { useLoading } from "../hooks/useLoading.js";
import Select from "react-select";
import { X, MapPin, Home, Users } from "lucide-react";

const regionOptions = [
  { value: "south", label: "Miền Nam (Hồ Chí Minh,...)" },
  { value: "north", label: "Miền Bắc (Hà Nội,...)" },
  { value: "central", label: "Miền Trung (Đà Nẵng,...)" },
];

// Custom styles cho React Select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "white",
    borderColor: state.isFocused ? "#f97316" : "#d1d5db",
    borderRadius: "0.5rem",
    color: "#1f2937",
    minHeight: "2.75rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(249, 115, 22, 0.1)" : "none",
    "&:hover": {
      borderColor: "#f97316",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#f97316"
      : state.isFocused
      ? "#fed7aa"
      : "white",
    color: state.isSelected ? "white" : "#1f2937",
    "&:hover": {
      backgroundColor: "#fed7aa",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1f2937",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white",
    border: "1px solid #d1d5db",
  }),
  input: (provided) => ({
    ...provided,
    color: "#1f2937",
  }),
};

export default function CartPage() {
  const {
    cartItems,
    isLoading,
    updateItemQuantity,
    removeFromCart,
    clearCartItems,
  } = useCart();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showSuccess, showError, showWarning } = useNotification();
  const { withLoading } = useLoading();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    customerName: "",
    tableNumber: "",
    region: "south",
    restaurantId: "",
    restaurantName: "",
  });
  const [restaurantOptions, setRestaurantOptions] = useState([]);

  // Lấy danh sách chi nhánh theo miền
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!orderFormData.region) {
        setRestaurantOptions([]);
        setOrderFormData((prev) => ({ ...prev, restaurantId: "" }));
        return;
      }

      try {
        const data = await withLoading(
          () => getRestaurants({ region: orderFormData.region }),
          "Đang tải danh sách chi nhánh..."
        );
        const options = data.map((res) => ({
          value: res._id,
          label: `${res.name} (${res.address || "Chưa có địa chỉ"})`,
        }));
        setRestaurantOptions(options);
        if (!options.find((opt) => opt.value === orderFormData.restaurantId)) {
          setOrderFormData((prev) => ({ ...prev, restaurantId: "" }));
        }
      } catch (err) {
        showError(
          "Lỗi tải danh sách chi nhánh",
          "Không thể tải danh sách chi nhánh. Vui lòng thử lại sau."
        );
      }
    };
    fetchRestaurants();
  }, [orderFormData.region, orderFormData.restaurantId, withLoading, showError]);

  const handleOrderSubmit = async () => {
    // Validation
    if (!orderFormData.customerName.trim()) {
      showWarning("Thông tin chưa đầy đủ", "Vui lòng nhập tên khách hàng");
      return;
    }
    if (!orderFormData.tableNumber.trim()) {
      showWarning("Thông tin chưa đầy đủ", "Vui lòng nhập số bàn");
      return;
    }
    if (!orderFormData.region) {
      showWarning("Thông tin chưa đầy đủ", "Vui lòng chọn miền");
      return;
    }
    if (!orderFormData.restaurantId) {
      showWarning("Thông tin chưa đầy đủ", "Vui lòng chọn chi nhánh");
      return;
    }

    try {
      const orderData = {
          customerName: orderFormData.customerName,
          tableNumber: orderFormData.tableNumber,
          restaurantId: orderFormData.restaurantId,
          restaurantName: orderFormData.restaurantName,
          region: orderFormData.region,
      };
      console.log("Sending order data:", orderData);
      await createOrderFromCart(orderData, token);
      await clearCartItems();
      showSuccess("Thành công", "Đơn hàng đã được tạo thành công!");
      setShowOrderModal(false);
      setOrderFormData({
        customerName: "",
        tableNumber: "",
        region: "south",
        restaurantId: "",
      });
    } catch (err) {
      console.error("Order error:", err);
      showError("Lỗi", err.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  const checkout = async () => {
    if (!token) {
      showWarning("Cần đăng nhập", "Vui lòng đăng nhập để đặt hàng.");
      return;
    }
    setShowOrderModal(true);
  };

  // helpers
  const getItemImage = (m) => {
    return (
      m?.imageUrl ||
      m?.image ||
      m?.thumbnail ||
      (Array.isArray(m?.images) && m.images[0]) ||
      m?.photo ||
      null
    );
  };

  const items = cartItems.map((it) => {
    const m = it.menuItem || it.item || it.product || {};
    const id = it.menuItemId || m._id || it._id;
    const name = m.name || it.name || "";
    const price = m.price ?? it.price ?? 0;
    const quantity = it.quantity || 1;
    const image = getItemImage(m) || it.imageUrl || null;
    return { id, name, price, quantity, image };
  });

  const computedTotal = items.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>
        {isLoading ? (
          <div>Đang tải...</div>
        ) : items.length === 0 ? (
          <div>Giỏ hàng trống.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-white p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-16 bg-gray-200 overflow-hidden">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      {(it.price || 0).toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateItemQuantity(it.id, (it.quantity || 1) - 1)
                      }
                      className="px-2 bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{it.quantity || 1}</span>
                    <button
                      onClick={() =>
                        updateItemQuantity(it.id, (it.quantity || 1) + 1)
                      }
                      className="px-2 bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(it.id)}
                    className="ml-4 text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 h-fit rounded-lg shadow">
              <div className="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span className="font-semibold">
                  {(computedTotal || 0).toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearCartItems}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded transition"
                >
                  Xóa hết
                </button>
                <button
                  onClick={checkout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto animate-in fade-in zoom-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Thông tin đơn hàng</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="hover:bg-white/20 p-1 rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Tên Khách Hàng */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users size={16} className="inline mr-2" />
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={orderFormData.customerName}
                  onChange={(e) =>
                    setOrderFormData({ ...orderFormData, customerName: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                />
              </div>

              {/* Số Bàn */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Home size={16} className="inline mr-2" />
                  Số bàn *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: A1, B5, 10"
                  value={orderFormData.tableNumber}
                  onChange={(e) =>
                    setOrderFormData({ ...orderFormData, tableNumber: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                />
              </div>

              {/* Miền */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Miền *
                </label>
                <Select
                  options={regionOptions}
                  value={regionOptions.find((opt) => opt.value === orderFormData.region)}
                  onChange={(opt) =>
                    setOrderFormData({ ...orderFormData, region: opt?.value })
                  }
                  styles={customSelectStyles}
                  placeholder="Chọn miền..."
                  isSearchable={false}
                />
              </div>

              {/* Chi Nhánh */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Chi nhánh *
                </label>
                <Select
                  options={restaurantOptions}
                  value={restaurantOptions.find(
                    (opt) => opt.value === orderFormData.restaurantId
                  )}
                  onChange={(opt) =>
                    setOrderFormData({ 
                      ...orderFormData, 
                      restaurantId: opt?.value,
                      restaurantName: opt?.label
                    })
                  }
                  styles={customSelectStyles}
                  placeholder="Chọn chi nhánh..."
                  isSearchable
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Tổng tiền:</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(computedTotal || 0).toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleOrderSubmit}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-semibold transition shadow-lg"
              >
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
