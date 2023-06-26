import axios, { AxiosError, AxiosResponse } from "axios";
import { NextAuthOptions } from "next-auth";
/**
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import apiClient from "@/api";
import { SigninReqData, SigninResData } from "@/types/auth";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // https://next-auth.js.org/configuration/options#secret
  providers: [
    /**
     * @description CredentialsProvider
     * @see https://next-auth.js.org/configuration/providers/credentials
     * @see https://next-auth.js.org/providers/credentials
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        if (credentials == null) {
          return null;
        }

        const {
          data: { accessToken },
        } = await apiClient
          .post<SigninResData, AxiosResponse<SigninResData>, SigninReqData>(
            "/auth/login",
            credentials,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .catch((error: AxiosError) => {
            throw new Error(String(error.response?.status));
          });

        return {
          id: credentials.email,
          email: credentials.email,
          accessToken,
          name: "elon", // TODO name 관련 처리 어떻게 할지 고려
        };
      },
    }),
  ],
  callbacks: {
    // Important: call chain (jwt -> session)
    // https://next-auth.js.org/configuration/callbacks#jwt-callback
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    // https://next-auth.js.org/configuration/callbacks#session-callback
    async session({ session, token }) {
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
