import { Page, Locator } from "@playwright/test";
import { getDateFlexibilityOption, parseCalendarDate, selectDateFlexibility, selectDisplayedDate } from "../../../../testdata/helpers";

export class CalendarComponent {
  readonly page: Page;
  readonly calendarFrame!: Locator;
  readonly departureInputRange!: Locator;
  readonly returnInputRange!: Locator;

  readonly monthTable1!: Locator;
  readonly monthTable2!: Locator;

  private selectedDepartureDate?: string;

  constructor(page: Page) {
    this.page = page;
  }

  async initializeCalendar() {
    this.calendarFrame = this.page.locator(
      'div[class="sGVi sGVi-dropdown-content"]',
    );
    this.departureInputRange = this.calendarFrame.getByRole("combobox", {
      name: "Departure",
    });
    this.returnInputRange = this.calendarFrame.getByRole("combobox", {
      name: "Return",
    });
    this.monthTable1 = this.calendarFrame.getByRole("grid").nth(0);
    this.monthTable2 = this.calendarFrame.getByRole("grid").nth(1);
    return this;
  }

  async pickDates(dateString: string): Promise<void> {
    const { isoDate, calendarLabel } = parseCalendarDate(dateString);
    const departureDate = this.selectedDepartureDate;
    const isDeparture = departureDate === undefined;

    if (isDeparture) {
      const today = await this.page.evaluate(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      });
      if (isoDate < today) {
        throw new RangeError(
          `Departure date ${dateString} cannot be before today.`,
        );
      }
    } else if (isoDate < departureDate) {
      throw new RangeError(
        `Return date ${dateString} cannot be before departure date ${departureDate}.`,
      );
    }

    await selectDisplayedDate(
      [this.monthTable1, this.monthTable2],
      dateString,
      calendarLabel,
    );
    this.selectedDepartureDate = isDeparture ? isoDate : undefined;
  }

  async selectDateRange(
    departureDateOption: number,
    returnDateOption?: number,
  ): Promise<void> {
    const departureOption = getDateFlexibilityOption(departureDateOption);

    await this.page.getByRole("button", { name: /^Departure/ }).click();
    await selectDateFlexibility(
      this.page,
      this.departureInputRange,
      departureOption,
    );

    if (returnDateOption !== undefined) {
      const returnOption = getDateFlexibilityOption(returnDateOption);
      await selectDateFlexibility(this.page, this.returnInputRange, returnOption);
    }
  }
}
