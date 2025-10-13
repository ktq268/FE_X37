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

// PATCH /api/tables/:id/status { status }
export async function updateTableStatusById(tableId, status, token) {
  if (!tableId) throw new Error("tableId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/api/tables/${tableId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    token
  );
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
export async function getPendingBookings(token) {
  return request(`/api/bookings/pending`, { method: "GET" }, token);
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

// GET /api/bookings/by-date - Lấy booking theo ngày và giờ
export async function getBookingsByDate(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/bookings/by-date${params ? `?${params}` : ""}`,
    { method: "GET" },
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

// --- CART ---
export async function getCart(token) {
  return request(`/api/cart`, { method: "GET" }, token);
}

export async function addCartItem(
  { menuItemId, quantity = 1, notes = "" },
  token
) {
  if (!menuItemId) throw new Error("menuItemId is required");
  return request(
    `/api/cart/items`,
    { method: "POST", body: JSON.stringify({ menuItemId, quantity, notes }) },
    token
  );
}

export async function updateCartItem(
  menuItemId,
  { quantity, notes = "" },
  token
) {
  if (!menuItemId) throw new Error("menuItemId is required");
  return request(
    `/api/cart/items/${menuItemId}`,
    { method: "PUT", body: JSON.stringify({ quantity, notes }) },
    token
  );
}

export async function removeCartItem(menuItemId, token) {
  if (!menuItemId) throw new Error("menuItemId is required");
  return request(`/api/cart/items/${menuItemId}`, { method: "DELETE" }, token);
}

export async function clearCart(token) {
  return request(`/api/cart/clear`, { method: "DELETE" }, token);
}

// --- ORDERS ---
export async function createOrderFromCart(body = {}, token) {
  return request(
    `/api/orders/from-cart`,
    { method: "POST", body: JSON.stringify(body) },
    token
  );
}

export async function getMyOrders(token) {
  return request(`/api/orders/mine`, { method: "GET" }, token);
}

export async function getOrderDetail(orderId, token) {
  if (!orderId) throw new Error("orderId is required");
  return request(`/api/orders/${orderId}`, { method: "GET" }, token);
}

// --- STAFF ORDERS ---
export async function staffGetOrders(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/orders${params ? `?${params}` : ""}`,
    { method: "GET" },
    token
  );
}

export async function staffGetOrderDetail(orderId, token) {
  if (!orderId) throw new Error("orderId is required");
  return request(`/api/orders/${orderId}/detail`, { method: "GET" }, token);
}

export async function staffUpdateOrderStatus(orderId, status, token) {
  if (!orderId) throw new Error("orderId is required");
  if (!status) throw new Error("status is required");
  return request(
    `/api/orders/${orderId}/status`,
    { method: "PUT", body: JSON.stringify({ status }) },
    token
  );
}

export const getOrders = async (status) => {
  const response = await getOrders("/orders", { params: { status } });
  return response.data;
};
