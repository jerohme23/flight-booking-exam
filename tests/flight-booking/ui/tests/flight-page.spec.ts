import { test, expect } from "@playwright/test";
import { FlightPage } from "../pages";
import {
  TripDetialsComponent,
  CalendarComponent,
  TripComponent,
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
    itinerary: Array<{
      destination: string;
      departDate: string;
    }>;
  };
  boundary: PassengerData & {
    departureOffset: number;
    returnOffset: number;
    destination: string;
    departDate: string;
    returnDate: string;
  };
};

const flightBookingData: FlightBookingData = require("../../../testdata/fixtures/flight-booking.data.json");

let flightPage: FlightPage;
let tripComponent: TripComponent;
let calendarComponent: CalendarComponent;
let tripDetailsComponent: TripDetialsComponent;

test.describe("Flight Booking Tests", () => {
  test.beforeEach(async ({ page }) => {
    flightPage = new FlightPage(page);
    tripComponent = new TripComponent(page);
    calendarComponent = new CalendarComponent(page);
    tripDetailsComponent = new TripDetialsComponent(page);

    await page.goto(process.env.BASE_URL!);
    await expect(
      flightPage.logo,
      "Verify the flight booking page logo is visible before starting the test.",
    ).toBeVisible();

    await tripComponent.initializeComboBoxList();
    await calendarComponent.initializeCalendar();
    await tripDetailsComponent.initializedTripDetails();
  });

  test("should be able to select return trip option", async ({ page }) => {
    await expect(
      flightPage.returnTripSelection,
      "Verify the return-trip selector is visible before choosing the trip type.",
    ).toBeVisible();
    await flightPage.returnTripSelection.click();
    await flightPage.page
      .getByRole("option", { name: "Return", exact: true })
      .click();
    await expect(
      tripComponent.fromLocation,
      "Confirm the departure location field is enabled after selecting a return trip.",
    ).toBeEnabled();
    await expect(
      tripComponent.toLocation,
      "Confirm the destination location field is enabled after selecting a return trip.",
    ).toBeEnabled();

    await tripComponent.toLocation.click();
    await tripComponent.toLocation.fill(flightBookingData.return.destination);
    await page.keyboard.press("Enter");

    await calendarComponent.selectDateRange(
      flightBookingData.return.departureOffset,
      flightBookingData.return.returnOffset,
    );
    await calendarComponent.departureInputRange.click({ timeout: 5000 });

    await expect(
      calendarComponent.departureInputRange,
      "Verify the departure date selector shows the expected day offset label.",
    ).toHaveText("+ day after");
    await expect(
      calendarComponent.returnInputRange,
      "Verify the return date selector is set to the exact-date mode.",
    ).toHaveText("exact");

    await calendarComponent.pickDates(flightBookingData.return.departDate);
    await calendarComponent.pickDates(flightBookingData.return.returnDate);

    await expect(
      tripDetailsComponent.tripDetailsContainer,
      "Ensure the trip details section is enabled after selecting the travel dates.",
    ).toBeEnabled();
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addAdult,
      flightBookingData.return.adultsCount - 1,
    );
    await expect(
      tripDetailsComponent.adultsCount,
      "Verify the adult count matches the configured return-trip passenger total.",
    ).toHaveValue(String(flightBookingData.return.adultsCount));
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addChildren,
      flightBookingData.return.childrenCount,
    );
    await expect(
      tripDetailsComponent.childrenCount,
      "Verify the children count matches the configured return-trip total.",
    ).toHaveValue(String(flightBookingData.return.childrenCount));
    await tripDetailsComponent.selectChildrenAges(
      flightBookingData.return.childrenAges,
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addInfants,
      flightBookingData.return.infantCount,
    );
    await expect(
      tripDetailsComponent.infantsCount,
      "Verify the infant count matches the configured return-trip total.",
    ).toHaveValue(String(flightBookingData.return.infantCount));
    await tripDetailsComponent.selectCabinClass(
      flightBookingData.return.cabinClass,
    );
    await expect(
      tripDetailsComponent.cabinClass,
      "Ensure the chosen cabin class is checked for the return trip.",
    ).toBeChecked();
  });

  test("should be able to select one-way trip option", async ({ page }) => {
    await expect(
      flightPage.returnTripSelection,
      "Ensure the return-trip selector is visible before switching to one-way travel.",
    ).toBeVisible();
    await flightPage.returnTripSelection.click({ timeout: 5000 });
    await flightPage.page
      .getByRole("option", { name: "One-way", exact: true })
      .click({ timeout: 5000 });

    await expect(
      tripComponent.fromLocation,
      "Confirm the departure location field is enabled for the one-way trip.",
    ).toBeEnabled();
    await expect(
      tripComponent.toLocation,
      "Confirm the destination location field is enabled for the one-way trip.",
    ).toBeEnabled();

    await tripComponent.toLocation.click();
    await tripComponent.toLocation.fill(flightBookingData.return.destination);
    await page.keyboard.press("Enter");

    await calendarComponent.selectDateRange(
      flightBookingData.oneWay.departureOffset,
    );
    await calendarComponent.departureInputRange.click({ timeout: 5000 });

    await expect(
      calendarComponent.departureInputRange,
      "Verify the departure picker reflects the expected day offset label for one-way travel.",
    ).toHaveText("+ day after");

    await calendarComponent.pickDates(flightBookingData.oneWay.departDate);

    await expect(
      tripDetailsComponent.tripDetailsContainer,
      "Ensure the trip details panel is active after selecting the one-way departure date.",
    ).toBeEnabled();
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addAdult,
      flightBookingData.oneWay.adultsCount - 1,
    );
    await expect(
      tripDetailsComponent.adultsCount,
      "Verify the adult count matches the selected one-way passenger configuration.",
    ).toHaveValue(String(flightBookingData.oneWay.adultsCount), {
      timeout: 5000,
    });
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addChildren,
      flightBookingData.oneWay.childrenCount,
    );
    await expect(
      tripDetailsComponent.childrenCount,
      "Verify the child count matches the selected one-way passenger configuration.",
    ).toHaveValue(String(flightBookingData.oneWay.childrenCount), {
      timeout: 5000,
    });
    await tripDetailsComponent.selectChildrenAges(
      flightBookingData.oneWay.childrenAges,
    );
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addInfants,
      flightBookingData.oneWay.infantCount,
    );
    await expect(
      tripDetailsComponent.infantsCount,
      "Verify the infant count matches the selected one-way passenger configuration.",
    ).toHaveValue(String(flightBookingData.oneWay.infantCount), {
      timeout: 5000,
    });
    await tripDetailsComponent.selectCabinClass(
      flightBookingData.oneWay.cabinClass,
    );
    await expect(
      tripDetailsComponent.cabinClass,
      "Ensure the selected cabin class is checked for the one-way trip.",
    ).toBeChecked({ timeout: 5000 });
  });

  test("should be able to select multi-city trip option", async ({ page }) => {
    await expect(
      flightPage.returnTripSelection,
      "Ensure the trip selector is visible before switching to the multi-city mode.",
    ).toBeVisible();
    await flightPage.returnTripSelection.click();
    await flightPage.page
      .getByRole("option", { name: "Multi-city", exact: true })
      .click();

    for (const [
      index,
      itinerary,
    ] of flightBookingData.multiCity.itinerary.entries()) {
      const destinationInput = tripComponent.toLocation.nth(index);

      await expect(
        destinationInput,
        `Enter destination ${index + 1} location`,
      ).toBeEditable();
      await destinationInput.click({ timeout: 5000 });
      await destinationInput.fill(itinerary.destination);
      await expect(destinationInput).toHaveValue(itinerary.destination, {
        timeout: 5000,
      });
       await destinationInput.click({ timeout: 5000 });
      await destinationInput.press("Enter");
    }
  });

  test("should be able to see maximum numbers of passenger", async ({
    page,
  }) => {
    await expect(
      flightPage.returnTripSelection,
      "Ensure the trip selector is enabled before setting the boundary scenario.",
    ).toBeEnabled();
    await flightPage.returnTripSelection.click();
    await flightPage.page
      .getByRole("option", { name: "One-way", exact: true })
      .click();

    await expect(
      tripComponent.fromLocation,
      "Confirm both location fields can be used for the boundary test setup.",
    ).toBeEnabled();
    await expect(
      tripComponent.toLocation,
      "Confirm both location fields can be used for the boundary test setup.",
    ).toBeEnabled();

    await tripComponent.toLocation.click();
    await tripComponent.toLocation.fill(
      flightBookingData.boundary.destination,
      { timeout: 5000 },
    );
    await page.keyboard.press("Enter");

    await calendarComponent.selectDateRange(
      flightBookingData.boundary.departureOffset,
    );
    await calendarComponent.departureInputRange.click({ timeout: 5000 });

    await expect(
      calendarComponent.departureInputRange,
      "Verify the departure range label matches the expected boundary-date offset.",
    ).toHaveText("+ day after");

    await calendarComponent.pickDates(flightBookingData.boundary.departDate);

    await expect(
      tripDetailsComponent.tripDetailsContainer,
      "Ensure the trip details panel is enabled for the passenger-boundary scenario.",
    ).toBeEnabled();
    await expect(
      tripDetailsComponent.minusAdult,
      "Verify the adult decrement control is disabled at the minimum limit.",
    ).toBeDisabled();
    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addAdult,
      flightBookingData.boundary.adultsCount - 1,
    );
    await expect(
      tripDetailsComponent.addAdult,
      "Verify the add-adult button is disabled after reaching the maximum adult count.",
    ).toBeDisabled();
    await expect(
      tripDetailsComponent.adultsCount,
      "Verify the adult count does not exceed the boundary limit.",
    ).not.toHaveValue(String(flightBookingData.boundary.adultsCount));

    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.minusAdult,
      flightBookingData.boundary.adultsCount - 7,
    );

    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addInfants,
      flightBookingData.boundary.infantCount,
    );

    await tripDetailsComponent.addInfants.click({ force: true });

    await expect(
      tripDetailsComponent.infantsOverAdults,
      "Verify the validation message appears when the infant count exceeds the allowed adult ratio.",
    ).toBeVisible();

    await tripDetailsComponent.clickMultipleTimes(
      tripDetailsComponent.addChildren,
      flightBookingData.boundary.childrenCount,
    );
    await expect(
      tripDetailsComponent.childrenCount,
      "Verify the total child count stays below the maximum child limit.",
    ).not.toHaveValue(String(flightBookingData.boundary.childrenCount));
    await tripDetailsComponent.selectChildrenAges(
      flightBookingData.boundary.childrenAges,
    );

    await expect(
      tripDetailsComponent.addChildren,
      "Verify the add-children control is disabled at the maximum boundary.",
    ).toBeDisabled();
    await expect(
      tripDetailsComponent.addInfants,
      "Verify the add-infants control is disabled at the maximum boundary.",
    ).toBeDisabled();

    const totalChildrenInfant =
      Number(await tripDetailsComponent.childrenCount.inputValue()) +
      Number(await tripDetailsComponent.infantsCount.inputValue());

    await expect(
      totalChildrenInfant,
      "Check if total count of Children and Infants is equal to 7",
    ).toEqual(7);
    await tripDetailsComponent.selectCabinClass(
      flightBookingData.boundary.cabinClass,
    );
    await expect(
      tripDetailsComponent.cabinClass,
      "Ensure the selected cabin class is checked in the boundary scenario.",
    ).toBeChecked();
  });
});
