import { Page, Locator } from "@playwright/test";

export class TripDetialsComponent {
  readonly page: Page;
  readonly tripDetailsContainer: Locator;

  readonly minusAdult!: Locator;
  readonly addAdult!: Locator;
  readonly minusChildren!: Locator;
  readonly addChildren!: Locator;
  readonly minusInfants!: Locator;
  readonly addInfants!: Locator;

  readonly adultsCount!: Locator;
  readonly childrenCount!: Locator;
  readonly infantsCount!: Locator;


  readonly cabinClass!: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tripDetailsContainer = this.page.locator(`div[class="cvdH cvdH-mod-spacing-base"]`);
  }

  async initializedTripDetails() {
    this.addAdult = this.page.getByRole("button", { name: "Increment" }).nth(0);
    this.minusAdult = this.page.getByRole("button", { name: "Decrement" }).nth(0);
    this.addChildren = this.page.getByRole("button", { name: "Increment" }).nth(1);
    this.minusChildren = this.page.getByRole("button", { name: "Decrement" }).nth(1);
    this.addInfants = this.page.getByRole("button", { name: "Increment" }).nth(2);
    this.minusInfants = this.page.getByRole("button", { name: "Decrement" }).nth(2);

    this.adultsCount = this.page.locator('input[aria-label="Adults"]');
    this.childrenCount = this.page.locator('input[aria-label="Children"]');
    this.infantsCount = this.page.locator('input[aria-label="Infants on lap"]');
  }

  async clickMultipleTimes(locator: Locator, count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await locator.click({ timeout: 5000 });
    }
  }

  async selectChildrenAges(ages: number[]): Promise<void> {
    const childAgeContainers = this.page.locator('div[class="oz3I"]');

    for (const [index, age] of ages.entries()) {
      const ageCombobox = childAgeContainers.nth(index).getByRole("combobox");
      console.log(ageCombobox);
      await ageCombobox.click({timeout: 5000});
      await this.page.getByRole("option", { name: String(age), exact: true }).click({ timeout: 5000 });
    }
  }

  async selectCabinClass(classType: string) {
    this.cabinClass = this.page.getByRole("radio", { name: classType });
    await this.cabinClass.click({ timeout: 5000 });
  }

}
