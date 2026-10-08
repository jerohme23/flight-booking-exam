const API_BASE_URL = (
  process.env.API_BASE_URL || "https://restful-booker.herokuapp.com"
).replace(/\/+$/, "");

export const BOOKING_ROUTES = {
  bookings: `${API_BASE_URL}/booking`,
  bookingById: (id: number) => `${API_BASE_URL}/booking/${id}`,
} as const;

export const AUTH_ROUTE = `${API_BASE_URL}/auth`;
