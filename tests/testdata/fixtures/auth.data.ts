import { AuthCredentials } from "../../api/types/auth.types";
import { userFixture } from "../../testdata/user-fixture";

const username = userFixture.username;
const password = process.env.API_AUTH_PASSWORD;

if (!password) {
  throw new Error(
    "API_AUTH_PASSWORD is not set. Configure it in env/.env.local.",
  );
}

export const AuthData: Record<string, AuthCredentials> = {
  validUser: {
    username,
    password,
  },
  invalidPassword: {
    username,
    password: "invalid_password",
  },
  invalidUsername: {
    username: "invalid_user",
    password,
  },
  emptyUsername: {
    username: "",
    password,
  },
  emptyPassword: {
    username,
    password: "",
  },
  emptyCredentials: {
    username: "",
    password: "",
  },
};