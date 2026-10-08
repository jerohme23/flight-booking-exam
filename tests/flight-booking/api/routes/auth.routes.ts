export const AUTH_ROUTES = {
  createToken: `${process.env.API_BASE_URL}/auth`,
} as const;

export const AuthRoutes = AUTH_ROUTES;