import { AuthTokenResponse } from "../types/auth.types";

export class AuthTokenModel {
  constructor(public readonly token: string) {}

  static fromResponse(response: AuthTokenResponse): AuthTokenModel {
    return new AuthTokenModel(response.token);
  }
}
