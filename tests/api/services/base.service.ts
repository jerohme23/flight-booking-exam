import { ApiClient } from '../client/api.client';

export abstract class BaseService {
  constructor(protected apiClient: ApiClient) {}
  protected buildTokenHeader(token: string): Record<string, string> {
    return {
      Cookie: `token=${token}`,
      "Content-Type": "application/json",
    };
  }
}
