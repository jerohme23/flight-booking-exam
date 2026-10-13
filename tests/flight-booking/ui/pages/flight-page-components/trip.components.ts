import { Page, Locator } from "@playwright/test";

export class TripComponent {
  readonly page: Page;

  readonly fromLocation: Locator;
  readonly toLocation: Locator;

  readonly calendarFrame: Locator;
  readonly fromInput: Locator;
  readonly toInput: Locator;
  destinationLocationCombobox!: Locator;

  constructor(page: Page) {
    this.page = page;

    this.fromLocation = page.getByRole("combobox", { name: "Origin location" });
    this.toLocation = this.page
      .getByRole("combobox", { name: /Destination location|Ask anything/i })
    this.calendarFrame = page.locator('div[class="sGVi sGVi-dropdown-content"]');
    this.fromInput = this.calendarFrame.getByRole("textbox", { name: "From" });
    this.toInput = this.calendarFrame.getByRole("textbox", { name: "To" });
  }

  async initializeComboBoxList() {
    this.destinationLocationCombobox = this.page.getByRole("combobox", {
      name: "Destination location",
    }).first();
    return this;
  }
}