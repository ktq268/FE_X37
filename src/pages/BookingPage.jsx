// BookingPage.jsx (Đã sửa lỗi gọi API và giữ nguyên UI cũ)
import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header/Header";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Phone,
  Pen,
  Loader2,
  Mail,
  Globe,
  ArrowLeft,
} from "lucide-react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  checkAvailableTables,
  createReservation,
  getRestaurants,
} from "../api/api.js";

const regionOptions = [
  { value: "south", label: "Miền Nam (Hồ Chí Minh,...) " },
  { value: "north", label: "Miền Bắc (Hà Nội,...) " },
  { value: "central", label: "Miền Trung (Đà Nẵng,...) " },
];

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    dateTime: "",
    restaurantId: "",
    region: "south",
    adults: "",
    children: 0,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
  });

  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableInfo, setSelectedTableInfo] = useState(null);

  const navigate = useNavigate();

  // --- LẤY DANH SÁCH CHI NHÁNH THEO MIỀN ---
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!bookingDetails.region) {
        setRestaurantOptions([]);
        setBookingDetails((prev) => ({ ...prev, restaurantId: "" }));
        return;
      }

      try {
        const data = await getRestaurants({ region: bookingDetails.region });
        const options = data.map((res) => ({
          value: res._id,
          label: `${res.name} (${res.address || "Chưa có địa chỉ"})`,
          restaurantName: res.name,
        }));
        setRestaurantOptions(options);
        if (!options.find((opt) => opt.value === bookingDetails.restaurantId)) {
          setBookingDetails((prev) => ({ ...prev, restaurantId: "" }));
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách nhà hàng:", err);
      }
    };
    fetchRestaurants();
  }, [bookingDetails.region]);

  // Tên/Địa chỉ chi nhánh đã chọn để hiển thị ở Step 2
  const selectedRestaurantName = useMemo(() => {
    const selected = restaurantOptions.find(
      (opt) => opt.value === bookingDetails.restaurantId
    );
    if (selected) return selected.label;

    const availableRes = availabilityResults.find(
      (r) => r.restaurantId === bookingDetails.restaurantId
    );
    if (availableRes) return availableRes.restaurantName;

    const selectedRegion = regionOptions.find(
      (opt) => opt.value === bookingDetails.region
    );
    return selectedRegion
      ? `Tất cả chi nhánh trong ${selectedRegion.label}`
      : "Đang chọn...";
  }, [
    bookingDetails.restaurantId,
    restaurantOptions,
    availabilityResults,
    bookingDetails.region,
  ]);

  // --- XỬ LÝ INPUTS & SELECTS (Giữ nguyên) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (step === 1) {
      setBookingDetails((prev) => ({ ...prev, [name]: value }));
      if (
        name === "dateTime" ||
        name === "adults" ||
        name === "children" ||
        name === "region"
      ) {
        setAvailabilityResults([]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegionChange = (selectedOption) => {
    setBookingDetails((prev) => ({
      ...prev,
      region: selectedOption ? selectedOption.value : "",
      restaurantId: "",
    }));
    setAvailabilityResults([]);
  };

  const handleRestaurantChange = (selectedOption) => {
    setBookingDetails((prev) => ({
      ...prev,
      restaurantId: selectedOption ? selectedOption.value : "",
    }));
    setAvailabilityResults([]);
  };

  // --- STEP 1: KIỂM TRA BÀN TRỐNG (CHECK AVAILABILITY) ---
  const handleCheckAvailability = async (e) => {
    e.preventDefault();

    if (
      !bookingDetails.dateTime ||
      !bookingDetails.adults ||
      bookingDetails.adults < 1 ||
      !bookingDetails.region
    ) {
      alert("Vui lòng chọn ngày/giờ, số lượng khách (người lớn) và Miền.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để kiểm tra bàn trống.");
      return;
    }

    setIsLoading(true);
    setAvailabilityResults([]);

    try {
      const [date, time] = bookingDetails.dateTime.split("T");

      // **ĐÃ SỬA:** Chuẩn bị data object để gửi qua body (POST)
      const data = {
        region: bookingDetails.region,
        date: date,
        time: time,
        adults: parseInt(bookingDetails.adults),
        children: parseInt(bookingDetails.children),
      };

      if (bookingDetails.restaurantId) {
        data.restaurantId = bookingDetails.restaurantId;
      }

      const result = await checkAvailableTables(data, token); // Gọi POST /api/available-tables

      setAvailabilityResults(result.availableRestaurants || []);

      if (
        !result.availableRestaurants ||
        result.availableRestaurants.length === 0
      ) {
        alert("Xin lỗi, không còn bàn trống phù hợp với yêu cầu của bạn.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kiểm tra bàn trống: " + err.message); // Hiển thị lỗi từ API nếu có
    } finally {
      setIsLoading(false);
    }
  };

  // --- CHUYỂN SANG STEP 2 (Giữ nguyên) ---
  const handleSelectRestaurantAndContinue = (restaurantId, availableTables) => {
    const tableToReserve = availableTables[0];
    if (!tableToReserve || !tableToReserve.tableId) {
      // Backend trả về tableId
      alert("Thông tin bàn bị thiếu. Vui lòng thử lại.");
      return;
    }

    setBookingDetails((prev) => ({ ...prev, restaurantId: restaurantId }));
    setSelectedTableInfo(tableToReserve);
    setStep(2);
  };

  // --- STEP 2: XỬ LÝ SUBMIT (TẠO BOOKING) (Giữ nguyên) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedTableInfo || !bookingDetails.restaurantId || !token) {
      alert(
        "Thông tin đặt bàn hoặc đăng nhập bị thiếu. Vui lòng kiểm tra lại."
      );
      return;
    }

    const [date, time] = bookingDetails.dateTime.split("T");

    try {
      const res = await createReservation(
        {
          restaurantId: bookingDetails.restaurantId,
          tableId: selectedTableInfo.tableId, // Gửi tableId đã chọn
          date: date,
          time: time,
          adults: parseInt(bookingDetails.adults),
          children: parseInt(bookingDetails.children),
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          note: formData.note,
        },
        token
      );

      if (res && res._id) {
        alert("Đặt bàn thành công! Mã đặt bàn của bạn: " + res._id);
        navigate("/booking-success");
      } else {
        alert("Đặt bàn thất bại: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đặt bàn");
    }
  };

  // --- Custom styles cho React Select (Giữ nguyên) ---
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "0.5rem",
      color: "white",
      minHeight: "3rem",
      paddingLeft: "2.75rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(251, 146, 60, 0.5)" : "none",
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "rgba(251, 146, 60, 0.2)"
        : state.isFocused
        ? "rgba(255, 255, 255, 0.1)"
        : "transparent",
      color: "white",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "white",
    }),
  };

  // --- JSX TEMPLATE (Giữ nguyên UI) ---
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 pt-20 md:pt-24">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
      </div>

      {/* Header */}
      <div className="relative z-[9999]">
        <Header />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Đặt bàn</h1>
            <p className="text-gray-300">
              Đặt bàn ngay để trải nghiệm ẩm thực đỉnh cao
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20">
            {step === 1 ? (
              <form onSubmit={handleCheckAvailability} className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-orange-300 transition"
                    aria-label="Quay lại trang chủ"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-semibold text-white">
                    Chọn thông tin đặt bàn
                  </h2>
                </div>

                {/* Input: Ngày/giờ (Giữ nguyên) */}
                <div className="relative animate-slide-in">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={bookingDetails.dateTime}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* SELECT: MIỀN (REGION) */}
                <div
                  className="relative animate-slide-in"
                  style={{ animationDelay: "0.05s" }}
                >
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Select
                    name="region"
                    value={regionOptions.find(
                      (option) => option.value === bookingDetails.region
                    )}
                    onChange={handleRegionChange}
                    options={regionOptions}
                    placeholder="Chọn Miền (Bắc/Trung/Nam)"
                    styles={customSelectStyles}
                    required
                  />
                </div>

                {/* SELECT: CHI NHÁNH (RESTAURANT) */}
                <div
                  className="relative animate-slide-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Select
                    name="restaurantId"
                    value={restaurantOptions.find(
                      (option) => option.value === bookingDetails.restaurantId
                    )}
                    onChange={handleRestaurantChange}
                    options={restaurantOptions}
                    placeholder={
                      restaurantOptions.length > 0
                        ? "Chọn Chi nhánh (Tùy chọn)"
                        : "Đang tải chi nhánh..."
                    }
                    styles={customSelectStyles}
                    isDisabled={restaurantOptions.length === 0}
                  />
                </div>

                {/* SỐ LƯỢNG KHÁCH (NGƯỜI LỚN) */}
                <div
                  className="relative animate-slide-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="adults"
                    value={bookingDetails.adults}
                    onChange={handleInputChange}
                    placeholder="Số lượng khách (Người lớn)"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    min="1"
                    required
                  />
                </div>

                {/* SỐ LƯỢNG KHÁCH (TRẺ EM) */}
                <div
                  className="relative animate-slide-in"
                  style={{ animationDelay: "0.25s" }}
                >
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="children"
                    value={bookingDetails.children}
                    onChange={handleInputChange}
                    placeholder="Số lượng trẻ em (tùy chọn)"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    min="0"
                  />
                </div>

                {/* BUTTON: KIỂM TRA BÀN TRỐNG */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in flex justify-center items-center"
                  style={{ animationDelay: "0.3s" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    "Kiểm tra bàn trống"
                  )}
                </button>

                {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
                {availabilityResults.length > 0 && (
                  <div className="bg-white bg-opacity-5 p-4 rounded-lg border border-white border-opacity-20 text-white space-y-3 animate-slide-in">
                    <h3 className="text-lg font-semibold">
                      Kết quả tìm kiếm bàn trống:
                    </h3>

                    <ul className="space-y-2 text-gray-300 text-sm">
                      {availabilityResults.map((res) => (
                        <li
                          key={res.restaurantId}
                          className="flex items-center justify-between border-b border-white border-opacity-10 pb-2"
                        >
                          <span className="flex-1">
                            Chi nhánh {res.restaurantName}:{" "}
                            <span className="text-green-400 font-bold">
                              {res.tables.length} bàn trống
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleSelectRestaurantAndContinue(
                                res.restaurantId,
                                res.tables
                              )
                            }
                            className="py-1 px-3 text-xs font-medium rounded-lg shadow-md transform transition-all duration-200 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                          >
                            Đặt bàn tại đây
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            ) : (
              // --- Giao diện Step 2 (Xác nhận) ---
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-orange-300 transition"
                    aria-label="Quay lại trang chủ"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-semibold text-white">
                    Xác nhận thông tin đặt bàn
                  </h2>
                </div>
                <div className="text-gray-300 mb-4 space-y-1 p-3 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-20">
                  <p>
                    <span className="font-semibold">Chi nhánh:</span>{" "}
                    {selectedRestaurantName}
                  </p>
                  <p>
                    <span className="font-semibold">Ngày giờ:</span>{" "}
                    {bookingDetails.dateTime.replace("T", " ")}
                  </p>
                  <p>
                    <span className="font-semibold">Số lượng khách:</span>{" "}
                    {bookingDetails.adults} người lớn +{" "}
                    {bookingDetails.children} trẻ em
                  </p>
                  <p className="text-green-400">
                    Sẽ được đặt: 1 bàn phù hợp (Tự động chọn:{" "}
                    {selectedTableInfo?.tableNumber
                      ? `Bàn số ${selectedTableInfo.tableNumber}`
                      : "Đã chọn"}
                    )
                  </p>
                </div>

                {/* THÔNG TIN KHÁCH HÀNG (Giữ nguyên) */}
                <h3 className="text-xl font-semibold text-white mt-8 mb-4">
                  Thông tin của bạn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên */}
                  <div className="relative animate-slide-in">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Tên"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  {/* Họ */}
                  <div
                    className="relative animate-slide-in"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Họ"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  {/* Email */}
                  <div
                    className="relative animate-slide-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div
                    className="relative animate-slide-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
                {/* Ghi chú */}
                <div
                  className="relative animate-slide-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  <Pen className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú (nếu có)"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm h-24 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg shadow-lg mb-4 transition-all duration-300"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: "0.5s" }}
                >
                  Hoàn tất Đặt bàn
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
