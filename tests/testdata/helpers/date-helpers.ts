export function parseCalendarDate(dateString: string): {
  isoDate: string;
  calendarLabel: string;
} {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateString);
  if (!match) {
    throw new TypeError(`Date must use MM/DD/YYYY format; received "${dateString}".`);
  }

  const [, month, day, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) {
    throw new RangeError(`Invalid calendar date "${dateString}".`);
  }

  return {
    isoDate,
    calendarLabel: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
      .format(date)
      .replace(",", ""),
  };
}
