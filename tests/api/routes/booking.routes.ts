const BOOKER_API_URL = "https://restful-booker.herokuapp.com";

export const BOOKING_ROUTES = {
  bookings: `${BOOKER_API_URL}/booking`,
  bookingById: (id: number) => `${BOOKER_API_URL}/booking/${id}`,
} as const;

export const AUTH_ROUTE = `${BOOKER_API_URL}/auth`;
