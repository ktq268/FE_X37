// FE_X37/src/api/api.js
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

// --- STAFF: TABLES ---
// GET /api/tables?restaurantId=...&date=...&time=...
export async function getTables(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(`/tables${params ? `?${params}` : ""}`, { method: "GET" }, token);
}

// PATCH /api/tables/:id/status { status }
export async function updateTableStatusById(tableId, status, token) {
  if (!tableId) throw new Error("tableId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/tables/${tableId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    token
  );
}

// --- STAFF: BOOKINGS (orders by table) ---
// GET /api/bookings/table/:tableId?date=YYYY-MM-DD
export async function getBookingsByTable(tableId, query = {}, token) {
  if (!tableId) throw new Error("tableId is required");
  const params = new URLSearchParams(query).toString();
  return request(`/bookings/table/${tableId}${params ? `?${params}` : ""}`, { method: "GET" }, token);
}

// GET /api/bookings/pending - Lấy tất cả booking đang chờ xử lý
export async function getPendingBookings(token) {
  return request(`/bookings/pending`, { method: "GET" }, token);
}

// PATCH /api/bookings/:id/status { status, tableId? }
export async function updateBookingStatus(bookingId, status, token, additionalData = {}) {
  if (!bookingId) throw new Error("bookingId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/bookings/${bookingId}/status`,
    { method: "PATCH", body: JSON.stringify({ status, ...additionalData }) },
    token
  );
}

// GET /api/bookings/by-date - Lấy booking theo ngày và giờ
export async function getBookingsByDate(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(`/bookings/by-date${params ? `?${params}` : ""}`, { method: "GET" }, token);
}

// GET /api/bookings/restaurant/:restaurantId - Lấy booking theo nhà hàng
export async function getBookingsByRestaurant(restaurantId, query = {}, token) {
  if (!restaurantId) throw new Error("restaurantId is required");
  const params = new URLSearchParams(query).toString();
  return request(`/bookings/restaurant/${restaurantId}${params ? `?${params}` : ""}`, { method: "GET" }, token);
}