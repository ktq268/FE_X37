// ===== FRONTEND: api.js (Fixed) =====
const API_URL = "https://be-x37-eight.vercel.app/api"; 

// --- AUTH ---
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- TABLES --- (FIXED)
export async function checkAvailableTables(data, token) {
  // Split dateTime into date and time
  const dateTimeObj = new Date(data.date);
  const dateStr = dateTimeObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = dateTimeObj.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

  const requestData = {
    date: dateStr,
    time: timeStr,
    guestCount: data.guestCount,
    branch: data.branch // include branch if provided
  };

  const res = await fetch(`${API_URL}/tables/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token, // FIXED: Use x-auth-token instead of Authorization Bearer
    },
    body: JSON.stringify(requestData),
  });
  return res.json();
}

// --- RESERVATIONS ---
export async function createReservation(data, token) {
  // Split dateTime into date and time for backend
  const dateTimeObj = new Date(data.date);
  const dateStr = dateTimeObj.toISOString().split('T')[0];
  const timeStr = dateTimeObj.toTimeString().split(' ')[0].substring(0, 5);

  const requestData = {
    ...data,
    date: dateStr,
    time: timeStr
  };

  const res = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token, // FIXED: Use x-auth-token
    },
    body: JSON.stringify(requestData),
  });
  return res.json();
}

export async function getReservations(token) {
  const res = await fetch(`${API_URL}/reservations`, {
    method: "GET",
    headers: { "x-auth-token": token }, // FIXED: Use x-auth-token
  });
  return res.json();
}