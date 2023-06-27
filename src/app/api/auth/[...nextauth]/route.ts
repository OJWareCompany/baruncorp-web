import { AxiosError, AxiosResponse } from "axios";
import { NextAuthOptions, Session } from "next-auth";
/**
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import apiClient from "@/api";
import { RefreshResData, SigninReqData, SigninResData } from "@/types/auth";

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
          data: { accessToken, refreshToken },
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
          refreshToken,
          name: "elon", // TODO name 관련 처리 어떻게 할지 고려
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ trigger, user, token }) {
      if (trigger === "signIn") {
        const { name, email, accessToken, refreshToken } = user;
        return {
          name,
          email,
          accessToken,
          refreshToken,
        };
      }

      let authError: Session["authError"];
      let { accessToken } = token;
      const { refreshToken } = token;

      await apiClient
        .get<void>("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .catch(async (error: AxiosError<ErrorResponseData>) => {
          if (error.response?.data.errorCode === "10005") {
            await apiClient
              .get<RefreshResData>("/auth/refresh", {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              })
              .then((response) => {
                authError = "ACCESS_TOKEN_ERROR";
                accessToken = response.data.accessToken;
              })
              .catch((error: AxiosError<ErrorResponseData>) => {
                if (error.response?.data.errorCode === "10006") {
                  authError = "REFRESH_TOKEN_ERROR";
                  return;
                }

                authError = "UNKNOWN_ERROR";
              });
            return;
          }

          authError = "UNKNOWN_ERROR";
        });

      return { ...token, accessToken, authError };
    },
    async session({ session, token }) {
      const { accessToken, refreshToken, authError } = token;
      return {
        ...session,
        accessToken,
        refreshToken,
        authError,
        isValid: authError == null || authError === "ACCESS_TOKEN_ERROR",
      };
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
