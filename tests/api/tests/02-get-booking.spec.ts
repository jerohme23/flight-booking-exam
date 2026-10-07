import { expect, test } from "@playwright/test";
import { logApiExchange } from "../fixtures/api-logging";
import {
  getMostRecentCreatedBooking,
  markBookingForDeletion,
} from "../fixtures/booking-storage";
import { BOOKING_ROUTES } from "../routes/booking.routes";

test.describe("Get recent booking", () => {
  test("BOOKING-GET-001 should retrieve and select the most recently created booking", async ({
    request,
  }, testInfo) => {
    const recentBooking = await getMostRecentCreatedBooking();
    const url = BOOKING_ROUTES.bookingById(recentBooking.bookingid);
    const response = await request.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const responseBody = await response.text();
    await logApiExchange(testInfo, {
      method: "GET",
      url,
      status: response.status(),
      responseBody,
    });

    expect(response.status(), "Booking API response should have a 200 status").toBe(200);
    expect(JSON.parse(responseBody), "Booking details should match").toEqual(
      recentBooking.booking,
    );

    const selectedBooking = await markBookingForDeletion(
      recentBooking.bookingid,
    );
    const selectionLog =
      `Selected booking ${selectedBooking.bookingid} for deletion in ` +
      "fixtures/created-bookings.json";
    console.log(`\n[Storage]\n${selectionLog}\n`);
    await testInfo.attach("Booking selected for deletion", {
      body: selectionLog,
      contentType: "text/plain",
    });
  });
});
