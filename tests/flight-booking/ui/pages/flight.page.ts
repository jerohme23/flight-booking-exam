import { Page, Locator } from "@playwright/test";

export class FlightPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly askAiButton: Locator;
  readonly loginButton: Locator;
  readonly flightNavigation: Locator;
  readonly staysNavigation: Locator;
  readonly carNavigation: Locator;
  readonly signInModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page
      .locator('div[class="mc6t-logo mc6t-mod-hide-empty"]')
      .getByRole("presentation");
    this.loginButton = page.getByRole("button", { name: "Sign in" });
    this.askAiButton = page.getByRole("button", { name: "Ask AI" });
    this.flightNavigation = page.getByRole("menuitem", { name: "Flights" });
    this.staysNavigation = page.getByRole("menuitem", { name: "Stays" });
    this.carNavigation = page.getByRole("menuitem", { name: "Cars" });
    this.signInModal = page.locator('div[class="c-ulo-viewport"]');
  }

  getInitialPosition = async () => {
    const logoBox = await this.logo.boundingBox();
    const loginButtonBox = await this.loginButton.boundingBox();
    const askAiButtonBox = await this.askAiButton.boundingBox();

    const logoPosition = logoBox ? { x: logoBox.x, y: logoBox.y } : null;
    const loginButtonPosition = loginButtonBox
      ? { x: loginButtonBox.x, y: loginButtonBox.y }
      : null;
    const askAiButtonPosition = askAiButtonBox
      ? { x: askAiButtonBox.x, y: askAiButtonBox.y }
      : null;

    return { logoPosition, loginButtonPosition, askAiButtonPosition };
  };
}
