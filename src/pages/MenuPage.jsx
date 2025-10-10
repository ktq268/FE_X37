import { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  X,
  ChefHat,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { getMenuItems, getMenuItemDetail, getFullMenu } from "../api/api";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function MenuPage() {
  const [fullMenu, setFullMenu] = useState([]); // menu group theo category
  const [items, setItems] = useState([]); // kết quả search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: cố gắng lấy URL ảnh từ các field phổ biến
  const getItemImage = (item) => {
    // Nếu imageUrl là mảng, lấy phần tử đầu tiên
    if (Array.isArray(item?.imageUrl) && item.imageUrl.length > 0) {
      return item.imageUrl[0];
    }
  
    // Nếu là chuỗi, trả về trực tiếp
    if (typeof item?.imageUrl === "string") {
      return item.imageUrl;
    }
  
    // Dự phòng các key khác
    return (
      item?.image ||
      item?.thumbnail ||
      (Array.isArray(item?.images) && item.images[0]) ||
      item?.photo ||
      null
    );
  };  

  // load menu đầy đủ khi vào page (không pagination)
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getFullMenu(); // Load tất cả món
        setFullMenu(data);
      } catch (err) {
        console.error("Load full menu failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // tìm kiếm món ăn
  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setItems([]); // clear search → hiển thị lại full menu
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMenuItems({ q: searchTerm });
      setItems(data.items);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsLoading(false);
    }
  }

  // xem chi tiết món ăn
  async function handleViewDetail(id) {
    try {
      const detail = await getMenuItemDetail(id);
      setSelectedItem(detail);
    } catch (err) {
      console.error("Load detail failed", err);
    }
  }

  // Thêm vào giỏ hàng (localStorage)
  function addToCart(item) {
    try {
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");
      const index = existing.findIndex((x) => x._id === item._id);
      if (index >= 0) {
        existing[index].quantity = (existing[index].quantity || 1) + 1;
      } else {
        existing.push({ ...item, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(existing));
      // đóng modal sau khi thêm để chuẩn bị order sau này
      setSelectedItem(null);
    } catch (e) {
      console.error("Add to cart failed", e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://aulacviet.vn/wp-content/uploads/2021/09/Am-Thuc-Phap.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
              Thực đơn
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Khám phá những món ăn tuyệt vời của chúng tôi
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm món ăn yêu thích..."
                  className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border-0 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "..." : "Tìm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 mt-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : items.length > 0 ? (
          // Search Results
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Kết quả tìm kiếm cho "{searchTerm}"
              </h2>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setItems([]);
                }}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Xóa tìm kiếm
              </button>
            </div>
            <Swiper
              spaceBetween={16}
              slidesPerView={2}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="w-full"
            >
              {items.map((item) => (
                <SwiperSlide key={item._id}>
                  <div className="bg-transparent overflow-hidden h-full">
                    <div className="h-48 relative">
                      {getItemImage(item) ? (
                        <img
                          src={getItemImage(item)}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <ChefHat className="w-16 h-16 text-orange-400" />
                        </div>
                      )}
                    </div>
                    <div className="pt-3 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-semibold text-gray-800 flex-1 leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-sm font-semibold text-gray-700 ml-2 whitespace-nowrap">
                          {item.price
                            ? item.price.toLocaleString("vi-VN")
                            : "N/A"}{" "}
                          VNĐ
                        </span>
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => handleViewDetail(item._id)}
                          className="w-full bg-orange-500 text-white py-2 hover:bg-orange-600 transition-colors text-sm"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          // Full Menu by Categories
          <div>
            {fullMenu.map((group) => (
              <div key={group.category._id} className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {group.category.name}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                </div>
                <Swiper
                  spaceBetween={16}
                  slidesPerView={2}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                  }}
                  className="w-full"
                >
                  {group.items.map((item) => (
                    <SwiperSlide key={item._id}>
                      <div className="bg-transparent overflow-hidden group h-full">
                        <div className="h-48 relative overflow-hidden">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <ChefHat className="w-16 h-16 text-orange-400" />
                            </div>
                          )}
                        </div>
                        <div className="pt-3 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-base font-semibold text-gray-800 flex-1 leading-snug">
                              {item.name}
                            </h3>
                            <span className="text-sm font-semibold text-gray-700 ml-2 whitespace-nowrap">
                              {item.price
                                ? item.price.toLocaleString("vi-VN")
                                : "N/A"}{" "}
                              VNĐ
                            </span>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => handleViewDetail(item._id)}
                              className="w-full bg-orange-500 text-white py-2 hover:bg-orange-600 transition-colors text-sm"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal chi tiết món ăn */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div className="h-64 relative">
                {Array.isArray(selectedItem?.imageUrl) && selectedItem.imageUrl.length > 0 ? (
                  <Swiper
                    spaceBetween={8}
                    slidesPerView={1}
                    className="w-full h-full rounded-2xl overflow-hidden"
                  >
                    {selectedItem.imageUrl.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <img
                          src={img}
                          alt={`${selectedItem.name}-${idx}`}
                          className="w-full h-64 object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : getItemImage(selectedItem) ? (
                  <img
                    src={getItemImage(selectedItem)}
                    alt={selectedItem.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center rounded-2xl">
                    <ChefHat className="w-20 h-20 text-orange-400" />
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedItem.description}
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl font-bold text-orange-500">
                    {selectedItem.price
                      ? selectedItem.price.toLocaleString("vi-VN")
                      : "N/A"}{" "}
                    VNĐ
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>15-20 phút</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>2-4 người</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => addToCart(selectedItem)}
                    className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-lg"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
