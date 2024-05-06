/* eslint-disable */
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * - REFRESH_TOKEN_EXPIRED_ERROR: 리프래쉬 토큰 만료된 경우
 * - REFRESH_TOKEN_UNKNOWN_ERROR: 리프래쉬 토큰 이용해서 새로운 액세스 토큰 받으려 할 때 에러 나는 경우
 * - ACCESS_TOKEN_EXPIRED_ERROR:  액세스 토큰 만료된 경우
 */
type AuthError =
  | "REFRESH_TOKEN_EXPIRED_ERROR"
  | "REFRESH_TOKEN_UNKNOWN_ERROR"
  | "ACCESS_TOKEN_EXPIRED_ERROR";

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
