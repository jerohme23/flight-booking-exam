import { APIRequestContext, test as base } from "@playwright/test";
import { validBooking } from "../../testdata/fixtures/booking.data";
import { BOOKING_ROUTES } from "../routes/booking.routes";
import { CreateBookingResponse } from "../types/create-booking.type";
import { logApiExchange } from "./api-logging";
import { storeCreatedBooking } from "./booking-storage";

interface BookingFixtures {
  createdBooking: CreateBookingResponse;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCreateBookingResponse(
  value: unknown,
): value is CreateBookingResponse {
  if (!isRecord(value) || !isRecord(value.booking)) {
    return false;
  }

  const booking = value.booking;
  const dates = booking.bookingdates;

  return (
    typeof value.bookingid === "number" &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0 &&
    typeof booking.firstname === "string" &&
    typeof booking.lastname === "string" &&
    typeof booking.totalprice === "number" &&
    typeof booking.depositpaid === "boolean" &&
    isRecord(dates) &&
    typeof dates.checkin === "string" &&
    typeof dates.checkout === "string" &&
    typeof booking.additionalneeds === "string"
  );
}

async function createBooking(
  request: APIRequestContext,
  testInfo: Parameters<typeof logApiExchange>[0],
) {
  const response = await request.post(BOOKING_ROUTES.bookings, {
    data: validBooking,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const responseBody = await response.text();
  await logApiExchange(testInfo, {
    method: "POST",
    url: BOOKING_ROUTES.bookings,
    status: response.status(),
    requestBody: validBooking,
    responseBody,
  });

  if (response.status() !== 200) {
    throw new Error(
      `Booking API returned status ${response.status()}: ${responseBody}`,
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(responseBody);
  } catch (error) {
    throw new Error(
      `Booking API returned invalid JSON: ${responseBody}`,
      { cause: error },
    );
  }

  if (!isCreateBookingResponse(body)) {
    throw new Error(
      `Booking API returned an invalid create response: ${JSON.stringify(body)}`,
    );
  }

  await storeCreatedBooking(body);
  return body;
}

export const test = base.extend<BookingFixtures>({
  createdBooking: async ({ request }, use, testInfo) => {
    await use(await createBooking(request, testInfo));
  },
});

export { expect } from "@playwright/test";
