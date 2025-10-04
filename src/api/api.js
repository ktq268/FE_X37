import axios from "axios";

// api.js (Đã sửa đổi hoàn chỉnh)
const API_URL = "http://localhost:3000/api";

// Hàm tiện ích để gọi API (Giữ nguyên)
async function request(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "x-auth-token": token }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.message || `API request failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// --- AUTH (Giữ nguyên) ---
export async function registerUser(data) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

// --- RESTAURANTS (Lấy danh sách chi nhánh theo vùng) (Giữ nguyên GET) ---
// Endpoint: GET /api/restaurants?region=...
export async function getRestaurants(query = {}) {
  const params = new URLSearchParams(query).toString();
  return request(`/restaurants${params ? `?${params}` : ""}`);
}

// --- TABLES (Tìm bàn trống) ---
// **ĐÃ SỬA:** Dùng POST và gửi data qua body để khớp với availabilityController.js
// Endpoint: POST /api/available-tables
export async function checkAvailableTables(data, token) {
  // data là object { region, restaurantId?, date, time, adults, children? }
  return request(
    "/available-tables", // Không dùng query string
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
    "/bookings",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// --- OTHER (Giữ nguyên) ---
export async function getReservations(token) {
  return request("/bookings", { method: "GET" }, token);
}

// --- MENU (Lấy danh sách món ăn) ---
// Lấy danh sách món ăn (search, filter, pagination)
export async function getMenuItems({ q, tag, page = 1, limit = 20 } = {}) {
  const res = await axios.get(`${API_URL}/menu/items`, {
    params: { q, tag, page, limit },
  });
  return res.data; // { items: [...], pagination: {...} }
}

// Lấy chi tiết 1 món ăn
export async function getMenuItemDetail(id) {
  const res = await axios.get(`${API_URL}/menu/items/${id}`);
  return res.data; // { ...itemDetail }
}

// Lấy menu đầy đủ (group theo category)
export async function getFullMenu({ page = 1, limit = 20 } = {}) {
  const res = await axios.get(`${API_URL}/menu/full`, {
    params: { page, limit },
  });
  return res.data; // [ { category, items: [...] }, ... ]
}
