import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CreateBookingResponse } from "../types/create-booking.type";

const storagePath = path.join(__dirname, "created-bookings.json");
const lockPath = `${storagePath}.lock`;
const lockTimeoutMs = 30_000;

interface StoredBooking extends CreateBookingResponse {
  selectedForDeletion?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStoredBooking(value: unknown): value is StoredBooking {
  if (!isRecord(value) || !isRecord(value.booking)) {
    return false;
  }

  const booking = value.booking;
  const dates = booking.bookingdates;

  return (
    typeof value.bookingid === "number" &&
    Number.isInteger(value.bookingid) &&
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

async function acquireStorageLock(): Promise<void> {
  const deadline = Date.now() + lockTimeoutMs;

  while (true) {
    try {
      await mkdir(lockPath);
      return;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") {
        throw error;
      }

      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out waiting for booking storage lock: ${lockPath}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

async function readStoredBookings(): Promise<StoredBooking[]> {
  let contents: string;
  try {
    contents = await readFile(storagePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Booking storage contains invalid JSON: ${storagePath}`, {
      cause: error,
    });
  }

  if (!Array.isArray(parsed) || !parsed.every(isStoredBooking)) {
    throw new Error(
      `Booking storage must contain an array of valid booking records: ${storagePath}`,
    );
  }

  return parsed;
}

async function writeStoredBookings(
  bookings: StoredBooking[],
): Promise<void> {
  const temporaryPath = `${storagePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(bookings, null, 2)}\n`, {
    encoding: "utf8",
  });
  await rename(temporaryPath, storagePath);
}

export async function storeCreatedBooking(
  booking: CreateBookingResponse,
): Promise<void> {
  await acquireStorageLock();

  try {
    const bookings = await readStoredBookings();
    bookings.push({ ...booking, selectedForDeletion: false });
    await writeStoredBookings(bookings);
  } finally {
    await rm(lockPath, { recursive: true });
  }
}

export async function getMostRecentCreatedBooking(): Promise<CreateBookingResponse> {
  await acquireStorageLock();

  try {
    const bookings = await readStoredBookings();
    const booking = bookings.at(-1);

    if (!booking) {
      throw new Error(
        `No created bookings are available in storage: ${storagePath}`,
      );
    }

    return { bookingid: booking.bookingid, booking: booking.booking };
  } finally {
    await rm(lockPath, { recursive: true });
  }
}

export async function markBookingForDeletion(
  bookingId: number,
): Promise<CreateBookingResponse> {
  await acquireStorageLock();

  try {
    const bookings = await readStoredBookings();
    const selectedBooking = bookings.find(
      (booking) => booking.bookingid === bookingId,
    );

    if (!selectedBooking) {
      throw new Error(
        `Booking ${bookingId} was not found in storage: ${storagePath}`,
      );
    }

    const updatedBookings = bookings.map((booking) => ({
      ...booking,
      selectedForDeletion: booking.bookingid === bookingId,
    }));
    await writeStoredBookings(updatedBookings);

    return {
      bookingid: selectedBooking.bookingid,
      booking: selectedBooking.booking,
    };
  } finally {
    await rm(lockPath, { recursive: true });
  }
}

export async function getBookingMarkedForDeletion(): Promise<CreateBookingResponse> {
  await acquireStorageLock();

  try {
    const bookings = await readStoredBookings();
    const booking = bookings.find((entry) => entry.selectedForDeletion);

    if (!booking) {
      throw new Error(
        `No booking is marked for deletion in storage: ${storagePath}. Run get-booking.spec.ts first.`,
      );
    }

    return { bookingid: booking.bookingid, booking: booking.booking };
  } finally {
    await rm(lockPath, { recursive: true });
  }
}

export async function removeDeletedBooking(
  bookingId: number,
): Promise<number> {
  await acquireStorageLock();

  try {
    const bookings = await readStoredBookings();
    const remainingBookings = bookings.filter(
      (booking) => booking.bookingid !== bookingId,
    );
    const removedCount = bookings.length - remainingBookings.length;

    if (removedCount === 0) {
      throw new Error(
        `Deleted booking ${bookingId} was not found in storage: ${storagePath}`,
      );
    }

    await writeStoredBookings(remainingBookings);
    return removedCount;
  } finally {
    await rm(lockPath, { recursive: true });
  }
}
