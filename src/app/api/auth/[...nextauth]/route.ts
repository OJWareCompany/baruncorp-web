import { AxiosError } from "axios";
import { NextAuthOptions } from "next-auth";
/**
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import api from "@/api";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (credentials == null) {
          return null;
        }

        const { email, password } = credentials;

        const {
          data: { accessToken, refreshToken },
        } = await api.auth
          // .authenticationControllerPostSignInTime(
          //   { jwt: 10, refresh: 5 },
          //   { email, password }
          // )
          .authenticationControllerPostSignIn({ email, password })
          .catch((error: AxiosError) => {
            throw new Error(String(error.response?.status ?? 0));
          });

        const {
          data: { id, organizationId },
        } = await api.users
          .usersControllerGetUserInfo({
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .catch((error) => {
            throw new Error("0");
          });

        return { accessToken, refreshToken, email, id, organizationId };
      },
    }),
  ],
  callbacks: {
    async jwt({ trigger, user, token }) {
      if (trigger === "signIn") {
        return { ...user };
      }

      const accessTokenError = await api.auth
        .authenticationControllerGetMe({
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        })
        .then(() => null)
        .catch((error: AxiosError<ErrorResponseData>) => error);

      if (accessTokenError == null) {
        return token;
      }

      if (!accessTokenError.response?.data.errorCode.includes("10005")) {
        return { ...token, authError: "UNKNOWN_ERROR" };
      }

      const refreshTokenError = await api.auth
        .authenticationControllerGetRefresh({
          headers: {
            Authorization: `Bearer ${token.refreshToken}`,
          },
        })
        .then(({ data }) => {
          token.accessToken = data.accessToken;
          return null;
        })
        .catch((error: AxiosError<ErrorResponseData>) => error);

      if (refreshTokenError == null) {
        return token;
      }

      if (!refreshTokenError.response?.data.errorCode.includes("10006")) {
        return { ...token, authError: "UNKNOWN_ERROR" };
      }

      return { ...token, authError: "REFRESH_TOKEN_ERROR" };

      // const test = await api.auth
      //   .authenticationControllerGetMe({
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   })
      //   .then(() => accessToken)
      //   .catch(async (error: AxiosError<ErrorResponseData>) => {
      //     if (error.response?.data.errorCode.includes("10005")) {
      //       return await api.auth
      //         .authenticationControllerGetRefresh({
      //           headers: {
      //             Authorization: `Bearer ${refreshToken}`,
      //           },
      //         })
      //         .then(
      //           ({ data: { accessToken: newAccessToken } }) => newAccessToken
      //         )
      //         .catch((error: AxiosError<ErrorResponseData>) => {
      //           if (error.response?.data.errorCode.includes("10006")) {
      //             authError = "REFRESH_TOKEN_ERROR";
      //             return;
      //           }

      //           authError = "UNKNOWN_ERROR";
      //         });
      //       return null;
      //     }

      //     return null;
      //   });

      // return token;

      // let authError: Session["authError"];
      // let { accessToken } = token;
      // const { refreshToken } = token;

      // await api.auth
      //   .authenticationControllerGetMe({
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   })
      //   .catch(async (error: AxiosError<ErrorResponseData>) => {
      //     if (error.response?.data.errorCode.includes("10005")) {
      //       await api.auth
      //         .authenticationControllerGetRefresh({
      //           headers: {
      //             Authorization: `Bearer ${refreshToken}`,
      //           },
      //         })
      //         .then((response) => {
      //           accessToken = response.data.accessToken;
      //         })
      //         .catch((error: AxiosError<ErrorResponseData>) => {
      //           if (error.response?.data.errorCode.includes("10006")) {
      //             authError = "REFRESH_TOKEN_ERROR";
      //             return;
      //           }

      //           authError = "UNKNOWN_ERROR";
      //         });
      //       return;
      //     }

      //     authError = "UNKNOWN_ERROR";
      //   });

      // return {
      //   ...token,
      //   accessToken,
      //   authError,
      //   email: null,
      //   id: null,
      //   organizationId: null,
      // };
    },
    async session({ session, token }) {
      const { accessToken, email, id, organizationId, authError } = token;

      return { ...session, accessToken, authError, email, id, organizationId };
      // const { accessToken, refreshToken, authError } = token;
      // return {
      //   ...session,
      //   accessToken,
      //   refreshToken,
      //   authError,
      //   isValid: authError == null,
      // };
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
