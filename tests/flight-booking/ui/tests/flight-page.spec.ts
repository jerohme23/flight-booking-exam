import { test, expect } from "@playwright/test";
import { FlightPage, FlightSearch } from "../pages";
import {
  TripDetialsComponent,
  CalendarComponent,
  ReturnTripComponent,
} from "../pages/flight-page-components";
import { FlightBookingFixtures } from "../fixtures/fligh-page.fixture";

type PassengerData = FlightBookingFixtures & {
  adultsCount: number;
  childrenCount: number;
  childrenAges: number[];
  infantCount: number;
};

type FlightBookingData = {
  return: PassengerData & {
    departureOffset: number;
    returnOffset: number;
    destination: string;
    departDate: string;
    returnDate: string;
  };
  oneWay: PassengerData & {
    departureOffset: number;
    destination: string;
    departDate: string;
  };
  multiCity: PassengerData & {
    legs: Array<{
      destination: string;
      departDate: string;
    }>;
  };
};

const flightBookingData: FlightBookingData = require("../../../testdata/fixtures/flight-booking.data.json");

let flightPage: FlightPage;
let flightSearch: FlightSearch;
let returnTripComponent: ReturnTripComponent;
let calendarComponent: CalendarComponent;
let tripDetailsComponent: TripDetialsComponent;

test.describe("Flight Booking Tests", () => {
  test.beforeEach(async ({ page }) => {
    flightPage = new FlightPage(page);
    returnTripComponent = new ReturnTripComponent(page);
    calendarComponent = new CalendarComponent(page);
    tripDetailsComponent = new TripDetialsComponent(page);

    await page.goto(process.env.BASE_URL!);
    await expect(flightPage.logo).toBeVisible();

    await returnTripComponent.initializeComboBoxList();
    await calendarComponent.initializeCalendar();
    await tripDetailsComponent.initializedTripDetails();
  });

  test("should be able to select return trip option", async ({ page }) => {
    await expect(flightPage.returnTripSelection).toBeVisible();
    await flightPage.returnTripSelection.click();
    await flightPage.page
      .getByRole("option", { name: "Return", exact: true })
      .click();
    await expect(returnTripComponent.fromLocation).toBeEnabled();
    await expect(returnTripComponent.toLocation).toBeEnabled();

    await returnTripComponent.toLocation.fill(
      flightBookingData.return.destination,
    );
    await returnTripComponent.toLocation.press("Enter");

    await calendarComponent.selectDateRange(
      flightBookingData.return.departureOffset,
      flightBookingData.return.returnOffset,
    );
    await calendarComponent.departureInputRange.click({timeout:5000});

    await expect(calendarComponent.departureInputRange).toHaveText(
      "+ day after",
    );
    await expect(calendarComponent.returnInputRange).toHaveText("exact");

    await calendarComponent.pickDates(flightBookingData.return.departDate);
    await calendarComponent.pickDates(flightBookingData.return.returnDate);

    await expect(tripDetailsComponent.tripDetailsContainer).toBeEnabled();
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addAdult,
      flightBookingData.return.adultsCount - 1,
    );
    await expect(tripDetailsComponent.adultsCount).toHaveValue(
      String(flightBookingData.return.adultsCount),
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addChildren,
      flightBookingData.return.childrenCount,
    );
    await expect(tripDetailsComponent.childrenCount).toHaveValue(
      String(flightBookingData.return.childrenCount),
    );
    await tripDetailsComponent.selectChildrenAges(
      flightBookingData.return.childrenAges,
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addInfants,
      flightBookingData.return.infantCount,
    );
    await expect(tripDetailsComponent.infantsCount).toHaveValue(
      String(flightBookingData.return.infantCount),
    );
    await tripDetailsComponent.selectCabinClass(
      flightBookingData.return.cabinClass,
    );
    await expect(tripDetailsComponent.cabinClass).toBeChecked();
  });

  test("should be able to select one-way trip option", async ({ page }) => {
    await expect(flightPage.returnTripSelection).toBeVisible();
    await flightPage.returnTripSelection.click({ timeout: 5000 });
    await flightPage.page
      .getByRole("option", { name: "One-way", exact: true })
      .click({ timeout: 5000 });

    
    await expect(returnTripComponent.fromLocation).toBeEnabled();
    await expect(returnTripComponent.toLocation).toBeEnabled();

    await returnTripComponent.toLocation.fill(
      flightBookingData.oneWay.destination,
    );
    await returnTripComponent.toLocation.press("Enter");

    await calendarComponent.selectDateRange(
      flightBookingData.oneWay.departureOffset,
    );
    await calendarComponent.departureInputRange.click({ timeout: 5000 });

    await expect(calendarComponent.departureInputRange).toHaveText(
      "+ day after",
    );

    await calendarComponent.pickDates(flightBookingData.return.departDate);

    await expect(tripDetailsComponent.tripDetailsContainer).toBeEnabled();
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addAdult,
      flightBookingData.return.adultsCount - 1,
    );
    await expect(tripDetailsComponent.adultsCount).toHaveValue(
      String(flightBookingData.return.adultsCount),{ timeout: 5000 }
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addChildren,
      flightBookingData.return.childrenCount,
    );
    await expect(tripDetailsComponent.childrenCount).toHaveValue(
      String(flightBookingData.return.childrenCount),{ timeout: 5000 }
    );
    await tripDetailsComponent.selectChildrenAges(
      flightBookingData.return.childrenAges,
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addInfants,
      flightBookingData.return.infantCount,
    );
    await expect(tripDetailsComponent.infantsCount).toHaveValue(
      String(flightBookingData.return.infantCount),{ timeout: 5000 }
    );
    await tripDetailsComponent.selectCabinClass(
      flightBookingData.return.cabinClass,
    );
    await expect(tripDetailsComponent.cabinClass).toBeChecked({ timeout: 5000 });
  });

  test("should be able to select multi-city trip option", async ({ page }) => {
    await expect(flightPage.returnTripSelection).toBeVisible();
    await flightPage.returnTripSelection.click();
    await flightPage.page
      .getByRole("option", { name: "Multi-city", exact: true })
      .click();
  });
});
