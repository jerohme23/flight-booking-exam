# Flight Booking E2E Test Automation

Playwright and TypeScript test suite for flight-search UI behavior and the
Restful Booker API. Tests are organized into UI and API suites, with shared
page objects, fixtures, and test data.

## What is covered

### Flight-search UI

The UI suite is in `tests/flight-booking/ui/tests`:

- `landing-page.spec.ts` checks landing-page controls, navigation, and a
  narrow/mobile viewport layout.
- `flight-page.spec.ts` checks return, one-way, and multi-city trip selection,
  along with dates, passenger counts and ages, and cabin class.

Page objects and reusable components are in `tests/flight-booking/ui/pages`.
Flight-search values used by the tests are in
`tests/testdata/fixtures/flight-booking.data.json`.

### Booking API

The API suite is in `tests/flight-booking/api/tests`:

- `00-auth.spec.ts` checks successful authentication and invalid or empty
  credentials.
- `01-create-booking.spec.ts` creates a booking and validates its details.
- `02-get-booking.spec.ts` retrieves the latest stored booking and marks it
  for deletion.
- `03-delete-booking.spec.ts` authenticates, deletes the selected booking,
  verifies it is no longer available, and removes its record from local
  storage.

The create, get, and delete tests form a dependent lifecycle. The create test's
fixture stores the created booking in
`tests/flight-booking/api/fixtures/created-bookings.json`; the next tests use
that record to find and delete the same booking. The lifecycle script runs
these test files sequentially with one worker. Run that script instead of
running those three files in parallel.

## Run tests locally

### Requirements

- A supported Node.js LTS version and npm.
- The credentials required by the Restful Booker API tests.

Install project dependencies:

```sh
npm ci
```

Install Chromium for the focused test commands below:

```sh
npx playwright install chromium
```

Create `env/.env.local` (this file is ignored by Git) with the required
environment variables:

```dotenv
BASE_URL=https://www.cheapflights.com.au
API_BASE_URL=https://restful-booker.herokuapp.com
API_AUTH_PASSWORD=<Restful Booker API password>
```

The API username defaults to `admin` in `tests/testdata/user-fixture.ts`.
Keep real credentials in the ignored local env file or a CI secret; do not
commit them.

### Commands

Run Playwright's tests using all configured projects (Chromium, Firefox, and
WebKit):

```sh
npx playwright install
npm test
```

The booking lifecycle tests depend on shared state and must run sequentially.
The broad `npm test` command can schedule those tests alongside other tests;
for a reliable Chromium run, execute the following commands in order:

```sh
npx playwright test tests/flight-booking/api/tests/00-auth.spec.ts --project=chromium --workers=1
npm run test:booking-lifecycle
npx playwright test tests/flight-booking/ui --project=chromium
```

Avoid running the lifecycle files independently or in parallel; the get and
delete tests consume state written by the create and get tests respectively.

Run the UI suite in Chromium:

```sh
npx playwright test tests/flight-booking/ui --project=chromium
```

Run API authentication tests in Chromium:

```sh
npx playwright test tests/flight-booking/api/tests/00-auth.spec.ts --project=chromium --workers=1
```

Run the dependent create → retrieve/select → delete API lifecycle:

```sh
npm run test:booking-lifecycle
```

Run the Playwright interactive UI or debug mode:

```sh
npm run test:ui
npm run test:debug
```

## GitHub Actions

The workflow is [`playwright.yml`](.github/workflows/playwright.yml). On pushes
and pull requests targeting `main` or `master`, it runs on Ubuntu, installs
Node.js and npm dependencies, installs Playwright browsers, then runs API
authentication followed by the serial booking lifecycle. It uploads the HTML
Playwright report as the `playwright-report` artifact when available.

Configure the repository Actions secret `API_AUTH_PASSWORD` for the
authentication and booking lifecycle tests. The workflow supplies
`BASE_URL` and `API_BASE_URL`; credentials should not be written into the
workflow file.

**Current CI coverage note:** the workflow runs the API tests described above,
but does not currently run `tests/flight-booking/ui`. Run the UI command above
locally to execute the browser end-to-end suite.

## Reports and troubleshooting

Playwright writes test output to `test-results/` and the HTML report to
`playwright-report/`. Open the HTML report with:

```sh
npx playwright show-report playwright-report
```

If a lifecycle test cannot find a booking, run
`npm run test:booking-lifecycle` so creation completes before retrieval and
deletion. If authentication tests fail due to missing configuration, verify
that `API_AUTH_PASSWORD` is set in `env/.env.local` locally or as a GitHub
Actions secret in CI.
