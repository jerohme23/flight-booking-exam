import { Locator, Page } from "@playwright/test";

const dateFlexibilityOptions = [
  "exact",
  "+ day after",
  "+ day before",
  "± 1 day",
  "± 2 days",
  "± 3 days",
] as const;

export function getDateFlexibilityOption( index: number): (typeof dateFlexibilityOptions)[number] {
    console.log(dateFlexibilityOptions[index])
    if ( !Number.isInteger(index) || index < 0 || index >= dateFlexibilityOptions.length ) {
      
    throw new RangeError(
      `Date flexibility option index must be between 0 and ${dateFlexibilityOptions.length - 1}; received ${index}.`,
    );
  }

  return dateFlexibilityOptions[index];
}

export async function selectDisplayedDate(
  monthTables: readonly Locator[],
  isoDate: string,
  label: string,
): Promise<void> {
  for (const monthTable of monthTables) {
    const dateButton = monthTable.getByRole("button", {
      name: label,
      exact: true,
    });
    if (await dateButton.count()) {
      await dateButton.click();
      return;
    }
  }

  throw new Error(
    `Date ${isoDate} is not available in either displayed calendar month.`,
  );
}

export async function selectDateFlexibility(
  page: Page,
  combobox: Locator,
  optionName: string,
): Promise<void> {
  await combobox.click();
  const listboxId = await combobox.getAttribute("aria-controls");
  if (!listboxId) {
    throw new Error(
      "Date flexibility combobox is missing its aria-controls listbox reference.",
    );
  }

  await page
    .locator(`#${listboxId}`)
    .getByRole("option", { name: optionName, exact: true })
    .click();
}
