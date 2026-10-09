import {Page, Locator} from "@playwright/test";
import { CalendarComponent, ReturnTripComponent } from "./flight-page-components";

export class FlightSearch {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

}