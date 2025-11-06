// api.js (Đã sửa đổi hoàn chỉnh)
const API_URL = "https://be-x37-eight.vercel.app/api";

// Hàm tiện ích để gọi API với error handling chuẩn hóa
async function request(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "x-auth-token": token }),
    ...(options.headers || {}),
  };

  const url = `${API_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle no content response
    if (res.status === 304) {
      return null;
    }

    // Handle successful responses
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return await res.text();
    }

    // Handle error responses
    let errorMessage = `Lỗi ${res.status}: ${res.statusText}`;
    let errorDetails = null;

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response is not JSON, use status text
    }

    // Create standardized error object
    const error = new Error(errorMessage);
    error.status = res.status;
    error.statusText = res.statusText;
    error.details = errorDetails;
    error.endpoint = endpoint;

    throw error;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      networkError.type = 'NETWORK_ERROR';
      networkError.endpoint = endpoint;
      throw networkError;
    }

    // Re-throw API errors with additional context
    if (!error.endpoint) {
      error.endpoint = endpoint;
    }
    
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// --- AUTH ---
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

export async function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password) {
  return request(`/api/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
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
export async function deleteTable(id, token, force = false) {
  if (!id) throw new Error("table id is required");
  const query = force ? "?force=true" : "";
  return request(`/api/tables/${id}${query}`, { method: "DELETE" }, token);
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

// Generic orders fetcher with optional query and token
export async function getOrders(query = {}, token) {
  const params = new URLSearchParams(query).toString();
  return request(
    `/api/orders${params ? `?${params}` : ""}`,
    { method: "GET" },
    token
  );
}

// ===== INVOICE APIs =====

// Tạo hóa đơn từ order
export const createInvoiceFromOrder = async (orderId, token) => {
  return request(
    `/api/invoices`,
    {
      method: "POST",
      body: JSON.stringify({ orderId }),
    },
    token
  );
};

// Xuất PDF hóa đơn (/:id/export-pdf)
export const exportInvoicePdf = async (invoiceId, token) => {
  const url = `${API_URL}/api/invoices/${invoiceId}/export-pdf`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-auth-token": token,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("PDF export error response:", errorText);
      throw new Error(`Xuất PDF thất bại (${res.status}): ${errorText || res.statusText}`);
    }

    // Kiểm tra Content-Type để đảm bảo đó là PDF
    const contentType = res.headers.get("content-type");
    console.log("📄 Response Content-Type:", contentType);

    // Nếu BE trả về JSON (error case), xử lý đặc biệt
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await res.json();
      throw new Error(jsonData.message || "Lỗi khi xuất PDF");
    }

    // Trả về Blob với đúng MIME type
    const blob = await res.blob();
    console.log("✅ Blob size:", blob.size, "bytes");
    
    // Tạo blob với MIME type chính xác
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    return pdfBlob;
  } catch (error) {
    console.error("Export PDF error:", error);
    throw error;
  }
};


// --- FEEDBACK ---
// Gửi phản hồi theo order
export async function sendFeedback(data, token) {
  // data: { orderId, rating, comment }
  if (!data?.orderId) throw new Error("orderId is required");
  return request(
    `/api/orders/${data.orderId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify({ 
        rating: data.rating, 
        comment: data.comment 
      }),
    },
    token
  );
}

// Admin: Feedback stats theo chi nhánh
export const getFeedbackStats = async (restaurantId, token) => {
  const qs = restaurantId ? `?restaurantId=${restaurantId}` : "";
  return request(`/api/reports/feedback${qs}`, { method: "GET" }, token);
};

export async function getFeedbacks(params = {}, token) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )
  ).toString();

  // cache-busting để tránh 304
  const ts = Date.now();
  const url = `/api/feedback${query ? `?${query}&ts=${ts}` : `?ts=${ts}`}`;

  return request(
    url,
    { method: 'GET', cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } },
    token
  );
}

// Admin: Dashboard metrics (bàn, món, doanh thu orders)
export async function getDashboardMetrics(restaurantId, token) {
  if (!restaurantId) throw new Error("restaurantId is required");
  return request(`/api/reports/metrics?restaurantId=${restaurantId}`, { method: "GET" }, token);
}

// Gửi phản hồi cho 1 order (DEPRECATED - router CJS không dùng)
export async function sendOrderFeedback(orderId, data, token) {
  if (!orderId) throw new Error("orderId is required");
  return request(
    `/api/orders/${orderId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

