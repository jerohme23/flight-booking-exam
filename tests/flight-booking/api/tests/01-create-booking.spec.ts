import { expect, test } from "../fixtures/booking.fixture";
import { validBooking } from "../../../testdata/fixtures/booking.data";

test.describe("Booking API", () => {
  test("BOOKING-001 should create a booking with valid details", async ({
    createdBooking,
  }) => {
    expect(createdBooking.bookingid, "Booking ID should be a number").toEqual(
      expect.any(Number),
    );
    expect(createdBooking.booking, "Booking details should match").toEqual(
      validBooking,
    );
  });
});
