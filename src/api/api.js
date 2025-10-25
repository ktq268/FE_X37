import axios from "axios";
// api.js (Đã sửa đổi hoàn chỉnh)
const API_URL = "http://localhost:3000";

// Hàm tiện ích để gọi API (Đã cải thiện error handling)
async function request(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "x-auth-token": token }),
  };

  const url = `${API_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });


    if (res.status === 304) {
      return null; // Indicate no new data, let the caller decide what to do
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("API Error:", error);
      throw new Error(
        error.message || `API request failed: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
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

// Lấy thông tin user hiện tại từ token
export async function getCurrentUser(token) {
  if (!token) throw new Error("Missing auth token");
  return request("/api/auth/me", { method: "GET" }, token);
}

// --- RESTAURANTS (Lấy danh sách chi nhánh theo vùng) (Giữ nguyên GET) ---
// Endpoint: GET /api/restaurants?region=...
export async function getRestaurants(query = {}) {
  const params = new URLSearchParams(query).toString();
  return request(`/api/restaurants${params ? `?${params}` : ""}`);
}

// --- TABLES (Tìm bàn trống) ---
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
export async function getMenuItems(filters = {}, token) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.tag) params.append("tag", filters.tag);

  const queryString = params.toString();
  return request(`/api/menu/items${queryString ? `?${queryString}` : ""}`, {}, token);
}


// Lấy chi tiết 1 món ăn
export async function getMenuItemDetail(id) {
  return request(`/api/menu/items/${id}`);
}

export async function getFullMenu() {
  return request(`/api/menu/full`);
}

// Thêm món ăn (POST /api/menu/items)
export async function createMenuItem(data, token) {
  return request(
    `/api/menu/items`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// Cập nhật món ăn (PUT /api/menu/items/:id)
export async function updateMenuItem(id, data, token) {
  return request(
    `/api/menu/items/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    token
  );
}

// Xóa món ăn (DELETE /api/menu/items/:id)
export async function deleteMenuItem(id, token) {
  return request(`/api/menu/items/${id}`, { method: "DELETE" }, token);
}


// Lấy menu đầy đủ (group theo category) - không có pagination
export async function listFullMenu(query = {}) {
  const params = new URLSearchParams(query).toString();
  return request(`/api/menu/full${params ? `?${params}` : ""}`);
}


// --- STAFF: TABLES ---
// GET /api/tables?restaurantId=...&date=...&time=...
export async function getTables(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/tables${params ? `?${params}` : ""}`,
    { method: "GET" },
    token
  );
}

// PATCH /api/tables/:id/status { status, date }
export async function updateTableStatusById(tableId, status, token, additionalData = {}) {
  if (!tableId) throw new Error("tableId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/api/tables/${tableId}/status`,
    { method: "PATCH", body: JSON.stringify({ status, ...additionalData }) },
    token
  );
}

// POST /api/tables
export async function createTable(data, token) {
  return request(
    `/api/tables`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// PUT /api/tables/:id - Cập nhật bàn
export async function updateTable(id, data, token) {
  if (!id) throw new Error("table id is required");
  return request(
    `/api/tables/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}

// DELETE /api/tables/:id - Xóa bàn
export async function deleteTable(id, token) {
  if (!id) throw new Error("table id is required");
  return request(`/api/tables/${id}`, { method: "DELETE" }, token);
}



// --- STAFF: BOOKINGS (orders by table) ---
// GET /api/bookings/table/:tableId?date=YYYY-MM-DD
export async function getBookingsByTable(tableId, query = {}, token) {
  if (!tableId) throw new Error("tableId is required");
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/bookings/table/${tableId}${params ? `?${params}` : ""}`,
    { method: "GET" },
    token
  );
}

// GET /api/bookings/pending - Lấy tất cả booking đang chờ xử lý
export async function getPendingBookings(token, filters = {}) {
  const { restaurantId, region } = filters;
  const params = new URLSearchParams();
  
  if (restaurantId && restaurantId !== "all") {
    params.append("restaurantId", restaurantId);
  }
  
  if (region && region !== "all") {
    params.append("region", region);
  }
  
  const queryString = params.toString();
  return request(`/api/bookings/pending${queryString ? `?${queryString}` : ""}`, { method: "GET" }, token);
}

// PATCH /api/bookings/:id/status { status, tableId? }
export async function updateBookingStatus(
  bookingId,
  status,
  token,
  additionalData = {}
) {
  if (!bookingId) throw new Error("bookingId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/api/bookings/${bookingId}/status`,
    { method: "PATCH", body: JSON.stringify({ status, ...additionalData }) },
    token
  );
}

// GET /api/bookings/restaurant/:restaurantId - Lấy booking theo nhà hàng
export async function getBookingsByRestaurant(restaurantId, query = {}, token) {
  if (!restaurantId) throw new Error("restaurantId is required");
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/bookings/restaurant/${restaurantId}${params ? `?${params}` : ""}`,
    { method: "GET" },
    token
  );
}


// ADMIN: Dashboard
export const getFeedbackStats = async (token) => {
  return request(`/api/reports/feedback`, 
    { method: "GET" },
    token
  );
};

// --- ADMIN: REVENUE REPORT (Báo cáo doanh thu) ---
// Endpoint: GET /api/reports/revenue?restaurantId=...&range=...&from=...&to=...
export async function getRevenueReport(query = {}, token) {
  const { restaurantId, range, from, to } = query;
  if (!restaurantId) throw new Error("restaurantId is required");

  const params = new URLSearchParams();
  params.append("restaurantId", restaurantId);
  if (range) params.append("range", range);
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  return request(
    `/api/reports/revenue?${params.toString()}`,
    { method: "GET" },
    token
  );
}
