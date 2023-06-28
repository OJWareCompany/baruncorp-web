import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

type AuthError = "REFRESH_TOKEN_ERROR" | "UNKNOWN_ERROR";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    authError?: AuthError;
    isValid: boolean;
    user: {
      name: string;
      email: string;
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    authError?: AuthError;
  }
}
