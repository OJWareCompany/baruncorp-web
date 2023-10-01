/* eslint-disable */
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

type AuthError = "REFRESH_TOKEN_ERROR" | "UNKNOWN_ERROR";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    id: string;
    email: string;
    organizationId: string;
    authError?: AuthError;
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    id: string;
    email: string;
    organizationId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    id: string;
    email: string;
    organizationId: string;
    authError?: AuthError;
  }
}
