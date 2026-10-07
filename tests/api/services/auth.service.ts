import { APIRequestContext, APIResponse } from "@playwright/test";
import { ApiClient } from "../client/api.client";
import { AuthRoutes } from "../routes/auth.routes";
import { AuthCredentials, AuthTokenResponse } from "../types/auth.types";

export class AuthService {
  private readonly apiClient: ApiClient;

  constructor(client: APIRequestContext) {
    this.apiClient = new ApiClient(client);
  }

  async createToken(credentials: AuthCredentials): Promise<{
    response: APIResponse;
    token: string;
  }> {
    const { response, body } = await this.apiClient.post(
      AuthRoutes.createToken,
      credentials,
    );

    if (response.status() !== 200) {
      const detail =
        typeof body === "string" ? body : JSON.stringify(body ?? {});
      throw new Error(
        `Auth API returned an unexpected status ${response.status()}: ${detail}`,
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      const detail =
        typeof body === "string" ? body : JSON.stringify(body ?? {});
      throw new Error(
        `Auth API returned an invalid response: expected an object body. Response body: ${detail}`,
      );
    }

    const token = (body as Partial<AuthTokenResponse>).token;

    if (typeof token !== "string" || token.trim().length === 0) {
      const detail = JSON.stringify(body);
      throw new Error(
        `Auth API returned an invalid response: expected a non-empty string token. Response body: ${detail}`,
      );
    }

    return {
      response,
      token,
    };
  }
}