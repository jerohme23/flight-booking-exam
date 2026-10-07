import {
  APIRequestContext,
  APIResponse,
} from "@playwright/test";

export interface ApiClientResult {
  response: APIResponse;
  body: unknown;
}

export class ApiClient {
  constructor(private readonly client: APIRequestContext) {}

  async post(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiClientResult> {
    const response = await this.client.post(endpoint, {
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawText = await response.text();

    if (!rawText) {
      return { response, body: undefined };
    }

    try {
      return {
        response,
        body: JSON.parse(rawText),
      };
    } catch {
      return {
        response,
        body: rawText,
      };
    }
  }
}