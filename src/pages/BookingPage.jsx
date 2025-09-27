// BookingPage.jsx (Updated to work with fixed API)
import React, { useState } from 'react';
import { Calendar, MapPin, Users, User, Mail, Phone, Pen } from 'lucide-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { checkAvailableTables, createReservation } from "../api/api.js";

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    dateTime: '',
    branch: '',
    numberOfPeople: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: ''
  });

  // availability results for branches when user requests "Tất cả chi nhánh"
  const [availabilityResults, setAvailabilityResults] = useState({});
  // store available tables for reservation
  const [availableTables, setAvailableTables] = useState([]);
  // store last params used to check availability to avoid stale results
  const [lastAvailabilityCheck, setLastAvailabilityCheck] = useState({
    dateTime: '',
    numberOfPeople: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (step === 1) {
      setBookingDetails((prev) => ({ ...prev, [name]: value }));
      // clear availabilityResults if user changes date/time/people after a check
      if (name === 'dateTime' || name === 'numberOfPeople') {
        setAvailabilityResults({});
        setAvailableTables([]);
        setLastAvailabilityCheck({ dateTime: '', numberOfPeople: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBranchChange = (selectedOption) => {
    setBookingDetails((prev) => ({ ...prev, branch: selectedOption ? selectedOption.value : '' }));
    // clear availability results if switching away from "tat-ca-chi-nhanh"
    setAvailabilityResults({});
    setAvailableTables([]);
    setLastAvailabilityCheck({ dateTime: '', numberOfPeople: '' });
  };

  // Helper function to check availability for a single branch
  const checkAvailabilitySingle = async (branchValue, dateTime, numberOfPeople) => {
    try {
      const token = localStorage.getItem("token");
      const result = await checkAvailableTables({
        date: dateTime,
        time: dateTime,
        guestCount: numberOfPeople,
        branch: branchValue,
      }, token);
      return result.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();

    if (!bookingDetails.dateTime || !bookingDetails.numberOfPeople) {
      alert("Vui lòng chọn ngày/giờ và số lượng khách trước.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    // Nếu chọn 1 chi nhánh cụ thể
    if (bookingDetails.branch && bookingDetails.branch !== "tat-ca-chi-nhanh") {
      try {
        const result = await checkAvailableTables(
          {
            date: bookingDetails.dateTime,
            time: bookingDetails.dateTime,
            guestCount: bookingDetails.numberOfPeople,
            branch: bookingDetails.branch,
          },
          token
        );

        if (!result.success) {
          alert("Xin lỗi, chi nhánh không còn bàn trống: " + (result.message || ""));
          return;
        }

        // Store available tables for reservation
        setAvailableTables(result.data || []);
        setStep(2);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi kiểm tra bàn trống");
      }
      return;
    }

    // Nếu chọn "Tất cả chi nhánh"
    if (bookingDetails.branch === "tat-ca-chi-nhanh") {
      try {
        const branches = ["quan-1", "quan-3"];
        const results = {};
        for (const b of branches) {
          const r = await checkAvailableTables(
            {
              date: bookingDetails.dateTime,
              time: bookingDetails.dateTime,
              guestCount: bookingDetails.numberOfPeople,
              branch: b,
            },
            token
          );
          results[b] = r.success;
        }
        setAvailabilityResults(results);
        setLastAvailabilityCheck({
          dateTime: bookingDetails.dateTime,
          numberOfPeople: bookingDetails.numberOfPeople,
        });
      } catch (err) {
        console.error(err);
        alert("Lỗi khi kiểm tra chi nhánh");
      }
      return;
    }

    alert('Vui lòng chọn chi nhánh hoặc "Tất cả chi nhánh" để tiếp tục.');
  };

  // Called when user clicks the small "Tiếp tục" button next to a branch in the list
  const handleSelectBranchFromList = async (branchValue) => {
    // ensure date/time and numberOfPeople are present
    if (!bookingDetails.dateTime || !bookingDetails.numberOfPeople) {
      alert('Vui lòng chọn ngày/giờ và số lượng khách trước khi chọn chi nhánh.');
      return;
    }

    // If availabilityResults are stale or absent, re-check single branch
    const paramsChanged =
      lastAvailabilityCheck.dateTime !== bookingDetails.dateTime ||
      lastAvailabilityCheck.numberOfPeople !== bookingDetails.numberOfPeople;

    let isAvailable = availabilityResults[branchValue];
    if (isAvailable === undefined || paramsChanged) {
      isAvailable = await checkAvailabilitySingle(branchValue, bookingDetails.dateTime, bookingDetails.numberOfPeople);
    }

    if (!isAvailable) {
      alert('Chi nhánh này hiện không khả dụng cho yêu cầu của bạn.');
      return;
    }

    // Get available tables for this branch
    const token = localStorage.getItem("token");
    try {
      const result = await checkAvailableTables({
        date: bookingDetails.dateTime,
        time: bookingDetails.dateTime,
        guestCount: bookingDetails.numberOfPeople,
        branch: branchValue,
      }, token);
      
      if (result.success) {
        setAvailableTables(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }

    // OK: set chosen branch and go to step 2
    setBookingDetails((prev) => ({ ...prev, branch: branchValue }));
    setStep(2);
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await createReservation(
        {
          date: bookingDetails.dateTime,
          time: bookingDetails.dateTime,
          guestCount: bookingDetails.numberOfPeople,
          branch: bookingDetails.branch,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          note: formData.note,
          // Let backend auto-select available table
          tableId: availableTables.length > 0 ? availableTables[0]._id : null,
        },
        token
      );

      if (res.success) {
        alert("Đặt bàn thành công!");
        navigate("/booking-success");
      } else {
        alert("Đặt bàn thất bại: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đặt bàn");
    }
  };

  // Options cho chi nhánh (chỉ Quận 1 & Quận 3 + Tất cả)
  const branchOptions = [
    { value: 'quan-1', label: 'Quận 1, TP HCM' },
    { value: 'quan-3', label: 'Quận 3, TP HCM' },
    { value: 'tat-ca-chi-nhanh', label: 'Tất cả chi nhánh' }
  ];

  // Custom styles cho React Select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '0.5rem',
      color: 'white',
      minHeight: '3rem',
      paddingLeft: '2.75rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(251, 146, 60, 0.5)' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'rgba(251, 146, 60, 0.2)'
        : state.isFocused
        ? 'rgba(255, 255, 255, 0.1)'
        : 'transparent',
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'white',
    }),
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
      </div>

      {/* Main */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Đặt bàn</h1>
            <p className="text-gray-300">Đặt bàn ngay để trải nghiệm ẩm thực đỉnh cao</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white border-opacity-20">
            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Chọn thông tin đặt bàn</h2>

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

                <div className="relative animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="numberOfPeople"
                    value={bookingDetails.numberOfPeople}
                    onChange={handleInputChange}
                    placeholder="Số lượng khách"
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    min="1"
                    required
                  />
                </div>

                <div className="relative animate-slide-in" style={{ animationDelay: '0.1s' }}>
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Select
                    name="branch"
                    value={branchOptions.find(option => option.value === bookingDetails.branch)}
                    onChange={handleBranchChange}
                    options={branchOptions}
                    placeholder="Chọn chi nhánh"
                    styles={customSelectStyles}
                    isSearchable={false}
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Nếu user chọn "Tất cả chi nhánh" và đã bấm kiểm tra */}
                {bookingDetails.branch === 'tat-ca-chi-nhanh' && (
                  <div className="bg-white bg-opacity-5 p-4 rounded-lg border border-white border-opacity-20 text-white space-y-3 animate-slide-in">
                    <h3 className="text-lg font-semibold">Các chi nhánh khả dụng:</h3>

                    {Object.keys(availabilityResults).length === 0 ? (
                      <p className="text-gray-300 text-sm">
                        Vui lòng nhập đầy đủ các thông tin yêu cầu để được hiển thị chi nhánh khả dụng
                      </p>
                    ) : (
                      <ul className="space-y-2 text-gray-300 text-sm">
                        {[
                          { value: 'quan-1', label: 'Quận 1' },
                          { value: 'quan-3', label: 'Quận 3' }
                        ].map((b) => {
                          const available = !!availabilityResults[b.value];
                          return (
                            <li key={b.value} className="flex items-center justify-between">
                              <span>
                                Chi nhánh {b.label}:{" "}
                                {available ? (
                                  <span className="text-green-400">Available</span>
                                ) : (
                                  <span className="text-red-400">Unavailable</span>
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleSelectBranchFromList(b.value)}
                                disabled={!available}
                                className={`py-1 px-3 text-xs font-medium rounded-lg shadow-md transform transition-all duration-200 ${
                                  available
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                }`}
                              >
                                {available ? 'Tiếp tục' : 'Không khả dụng'}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: '0.3s' }}
                >
                  Tiếp tục
                </button>

                <a
                  href="/"
                  className="block mt-2 text-xs font-extralight text-orange-400 hover:text-orange-300 transition-colors text-center"
                >
                  Về lại trang chủ
                </a>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Xác nhận thông tin đặt bàn</h2>
                <div className="text-gray-300 mb-4 space-y-1">
                  <p>Ngày giờ: {bookingDetails.dateTime}</p>
                  <p>Chi nhánh: {bookingDetails.branch || 'Chưa chọn'}</p>
                  <p>Số lượng khách: {bookingDetails.numberOfPeople}</p>
                  {availableTables.length > 0 && (
                    <p className="text-green-400">
                      Bàn khả dụng: {availableTables.length} bàn
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative animate-slide-in">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Họ"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="relative animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="relative animate-slide-in" style={{ animationDelay: '0.3s' }}>
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

                  <div className="relative animate-slide-in md:col-span-2" style={{ animationDelay: '0.4s' }}>
                    <Pen className="absolute left-3 top-1/4 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú (nếu có)"
                      className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm h-24 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: '0.5s' }}
                >
                  Đặt bàn
                </button>

                <a
                  href="/"
                  className="block mt-2 text-xs font-extralight text-orange-400 hover:text-orange-300 transition-colors text-center"
                >
                  Về lại trang chủ
                </a>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 