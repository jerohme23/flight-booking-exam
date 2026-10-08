import type { CreateBookingResponse } from "../../flight-booking/api/types/create-booking.type";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBookingDetails(
  value: unknown,
): value is CreateBookingResponse["booking"] {
  if (!isRecord(value)) {
    return false;
  }

  const dates = value.bookingdates;

  return (
    typeof value.firstname === "string" &&
    typeof value.lastname === "string" &&
    typeof value.totalprice === "number" &&
    typeof value.depositpaid === "boolean" &&
    isRecord(dates) &&
    typeof dates.checkin === "string" &&
    typeof dates.checkout === "string" &&
    typeof value.additionalneeds === "string"
  );
}

export function isCreateBookingResponse(
  value: unknown,
): value is CreateBookingResponse {
  if (!isRecord(value) || !isBookingDetails(value.booking)) {
    return false;
  }

  return (
    typeof value.bookingid === "number" &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0
  );
}

export function isStoredBooking(
  value: unknown,
): value is CreateBookingResponse & { selectedForDeletion?: boolean } {
  return isCreateBookingResponse(value);
}
