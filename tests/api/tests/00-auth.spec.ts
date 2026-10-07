import { expect, test } from "@playwright/test";
import { AuthService } from "../services/auth.service";
import { AuthData } from "../../testdata/fixtures/auth.data";

test.describe("Auth API", () => {
  test("AUTH-001 should create authentication token with valid credentials", async ({
    request,
  }) => {
    const authService = new AuthService(request);

    const result = await authService.createToken(AuthData.validUser);

    expect(result.response.status()).toBe(200);
    expect(result.token).toBeTruthy();
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  test("AUTH-002 invalid username returns no valid token", async ({
    request,
  }) => {
    const authService = new AuthService(request);

    await expect( authService.createToken(AuthData.invalidUsername),).rejects.toThrow
    (/Bad credentials|expected a non-empty string token/);
  });

  test("AUTH-003 invalid password returns no valid token", async ({
    request,
  }) => {
    const authService = new AuthService(request);

    await expect(
      authService.createToken(AuthData.invalidPassword),
    ).rejects.toThrow(/Bad credentials|expected a non-empty string token/);
  });

  test("AUTH-004 empty username follows actual API response", async ({
    request,
  }) => {
    const authService = new AuthService(request);

    await expect(
      authService.createToken(AuthData.emptyUsername),
    ).rejects.toThrow(/Bad credentials|expected a non-empty string token/);
  });

  test("AUTH-005 empty password follows actual API response", async ({
    request,
  }) => {
    const authService = new AuthService(request);

    await expect(
      authService.createToken(AuthData.emptyPassword),
    ).rejects.toThrow(/Bad credentials|expected a non-empty string token/);
  });
});
