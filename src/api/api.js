// api.js (Đã sửa đổi hoàn chỉnh)
const API_URL = "http://localhost:3000";

// Hàm tiện ích để gọi API (Đã cải thiện error handling)
async function request(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "x-auth-token": token }),
  };

  const url = `${API_URL}${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`API Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("API Error:", error);
      throw new Error(
        error.message || `API request failed: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    console.log("API Success:", data);
    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

// --- AUTH (Giữ nguyên) ---
export async function registerUser(data) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- RESTAURANTS (Lấy danh sách chi nhánh theo vùng) (Giữ nguyên GET) ---
// Endpoint: GET /api/restaurants?region=...
export async function getRestaurants(query = {}) {
  const params = new URLSearchParams(query).toString();
  return request(`/api/restaurants${params ? `?${params}` : ""}`);
}

// --- TABLES (Tìm bàn trống) ---
// **ĐÃ SỬA:** Dùng POST và gửi data qua body để khớp với availabilityController.js
// Endpoint: POST /api/available-tables
export async function checkAvailableTables(data, token) {
  // data là object { region, restaurantId?, date, time, adults, children? }
  return request(
    "/api/available-tables", // Không dùng query string
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

// --- BOOKINGS (Đặt bàn) (Giữ nguyên POST) ---
// Endpoint: POST /api/bookings
export async function createReservation(data, token) {
  return request(
    "/api/bookings",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// --- OTHER (Giữ nguyên) ---
export async function getReservations(token) {
  return request("/api/bookings", { method: "GET" }, token);
}

// --- MENU (Lấy danh sách món ăn) ---
// Lấy danh sách món ăn (search, filter)
export async function getMenuItems({ q, tag } = {}) {
  const params = new URLSearchParams({ q, tag }).toString();
  return request(`/api/menu/items${params ? `?${params}` : ""}`);
}

// Lấy chi tiết 1 món ăn
export async function getMenuItemDetail(id) {
  return request(`/api/menu/items/${id}`);
}

// Lấy menu đầy đủ (group theo category) - không có pagination
export async function getFullMenu() {
  return request(`/api/menu/full`);
}
