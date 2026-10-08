import { test, expect } from '@playwright/test';
import { FlightPage } from '../pages/flight.page';

test.describe('Flight Booking Tests', () => {
    let flightPage: FlightPage;

    test.beforeEach(async ({ page }) => {
        flightPage = new FlightPage(page);
        await page.goto(process.env.BASE_URL!);
        await expect(flightPage.logo).toBeVisible();
    });

    test('should be able to see and function login button', async ({ page }) => {
        console.log('Y position of logo:', await flightPage.logo.boundingBox());
        console.log('Y position of login button:', await flightPage.loginButton.boundingBox());
        console.log('Y position of Ask AI button:', await flightPage.askAiButton.boundingBox());
        await expect(flightPage.logo).toBeVisible();
        await expect(flightPage.loginButton).toBeVisible();
        await flightPage.loginButton.click({timeout: 5000});
        await expect(flightPage.signInModal).toBeVisible();
    });

    test('should be able to see and function logo', async ({ page }) => {
        await expect(flightPage.logo).toBeVisible();
        await expect(flightPage.loginButton).toBeVisible();        

        await expect(flightPage.flightNavigation).toBeVisible();
        await expect(flightPage.staysNavigation).toBeVisible();
        await expect(flightPage.carNavigation).toBeVisible();
        await flightPage.staysNavigation.click();
        await expect(page).toHaveURL(/stays/);
        
        await flightPage.logo.click();
        await expect(page).toHaveURL('/',{timeout: 5000});
    });

    test(`should be able to check the UI changes with small resolution`, async ({ page }) => {
        const positions = await flightPage.getInitialPosition();
        await page.setViewportSize({ width: 375, height: 667 });
        
        await expect(flightPage.logo).toBeVisible();
        const currentLogoPosition = await flightPage.logo.boundingBox();
        expect(currentLogoPosition).not.toBeNull();
        expect(positions.logoPosition).not.toBeNull();
        expect({ x: currentLogoPosition!.x, y: currentLogoPosition!.y }).not.toEqual(positions.logoPosition);
        expect(positions.loginButtonPosition).not.toBeNull();
        expect(positions.askAiButtonPosition).not.toBeNull();

        await expect(flightPage.loginButton).toBeVisible();
        const currentLoginPosition = await flightPage.loginButton.boundingBox();
        expect(currentLoginPosition).not.toBeNull();
        expect(positions.logoPosition).not.toBeNull();
        expect({ x: currentLoginPosition!.x, y: currentLoginPosition!.y }).not.toEqual(positions.loginButtonPosition);
        expect(positions.loginButtonPosition).not.toBeNull();
        expect(positions.askAiButtonPosition).not.toBeNull();
        
        await expect(flightPage.askAiButton).toBeVisible();
        const currentAskAiPosition = await flightPage.askAiButton.boundingBox();
        expect(currentAskAiPosition).not.toBeNull();
        expect(positions.logoPosition).not.toBeNull();
        expect({ x: currentAskAiPosition!.x, y: currentAskAiPosition!.y }).not.toEqual(positions.askAiButtonPosition);
        expect(positions.loginButtonPosition).not.toBeNull();
        expect(positions.askAiButtonPosition).not.toBeNull();
    });


});
