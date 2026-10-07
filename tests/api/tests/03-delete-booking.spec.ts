import { expect, test } from "@playwright/test";
import { AuthData } from "../../testdata/fixtures/auth.data";
import { logApiExchange } from "../fixtures/api-logging";
import {
  getBookingMarkedForDeletion,
  removeDeletedBooking,
} from "../fixtures/booking-storage";
import { AUTH_ROUTE, BOOKING_ROUTES } from "../routes/booking.routes";

function isTokenResponse(value: unknown): value is { token: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "token" in value &&
    typeof value.token === "string" &&
    value.token.length > 0
  );
}

test.describe("Delete selected booking", () => {
  test("BOOKING-DELETE-001 should delete the booking selected by get-booking.spec.ts", async ({
    request,
  }, testInfo) => {
    const bookingToDelete = await getBookingMarkedForDeletion();
    const authResponse = await request.post(AUTH_ROUTE, {
      data: AuthData.validUser,
      headers: {
        "Content-Type": "application/json",
      },
    });

    await logApiExchange(testInfo, {
      method: "POST",
      url: AUTH_ROUTE,
      status: authResponse.status(),
      responseBody: "(authentication response omitted)",
    });
    expect(authResponse.status(), "Auth API response should have a 200 status").toBe(200);
    const authBody: unknown = await authResponse.json();
    expect(isTokenResponse(authBody), "Auth API response should contain a valid token").toBe(true);

    if (!isTokenResponse(authBody)) {
      throw new Error("Auth API response did not contain a valid token");
    }

    const url = BOOKING_ROUTES.bookingById(bookingToDelete.bookingid);
    const response = await request.delete(url, {
      headers: {
        Cookie: `token=${authBody.token}`,
      },
    });

    const responseBody = await response.text();
    await logApiExchange(testInfo, {
      method: "DELETE",
      url,
      status: response.status(),
      responseBody,
    });
    expect(response.status()).toBe(201);

    const verificationResponse = await request.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    const verificationBody = await verificationResponse.text();
    await logApiExchange(testInfo, {
      method: "GET",
      url,
      status: verificationResponse.status(),
      responseBody: verificationBody,
    });
    expect(verificationResponse.status()).toBe(404);

    const removedCount = await removeDeletedBooking(bookingToDelete.bookingid);
    const storageUpdate =
      `Removed ${removedCount} record for booking ${bookingToDelete.bookingid} ` +
      "from fixtures/created-bookings.json";
    console.log(`\n[Storage]\n${storageUpdate}\n`);
    await testInfo.attach("Booking storage update", {
      body: storageUpdate,
      contentType: "text/plain",
    });
    expect(removedCount, "Deleted booking should be removed from storage").toBe(1);
  });
});
