import { AxiosError } from "axios";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import api from "@/api";

const authOptions: NextAuthOptions = {
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

        return {
          accessToken,
          refreshToken,
          email,
          id,
          organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ trigger, user, token }) {
      // console.info(`jwt callback trigger ${trigger}`)
      if (trigger === "signIn") {
        return { ...user };
      }

      // console.info(`Call API Get Auth Me`)
      const accessTokenError = await api.auth
        .authenticationControllerGetMe({
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        })
        .then(() => null)
        .catch((error: AxiosError<ErrorResponseData>) => {
          // .catch((error: any) => {
          // console.info(`[Error] API Get Auth Me: ${error.response ? `${error.config.method} ${error.config.url} ${error.status} ${error.statusText}` : error}`)
          return error;
        });

      if (accessTokenError == null) {
        // console.info(`accessTokenError is null`)
        return token;
      }

      if (!accessTokenError.response?.data?.errorCode?.includes("10005")) {
        // console.info(`accessTokenError is not 10005, => authError is ACCESS_TOKEN_EXPIRED_ERROR`)
        return { ...token, authError: "ACCESS_TOKEN_EXPIRED_ERROR" };
      }

      // console.info(`Call API Get Refresh Token`)
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
        .catch((error: AxiosError<ErrorResponseData>) => {
          // .catch((error: any) => {
          //   console.info(`[Error] API Get Refresh Token: ${error.response ? `${error.config.method} ${error.config.url} ${error.status} ${error.statusText}` : error}`)
          return error;
        });

      if (refreshTokenError == null) {
        // console.info(`refreshTokenError is null`)
        return token;
      }

      // console.info(`#### refreshTokenError.response?.data.errorCode #### ${refreshTokenError.response?.data.errorCode}`)

      if (!refreshTokenError.response?.data?.errorCode?.includes("10006")) {
        // console.info(`refreshTokenError is not 10006, => authError is REFRESH_TOKEN_UNKNOWN_ERROR, ${refreshTokenError.response?.data?.errorCode}`)
        return { ...token, authError: "REFRESH_TOKEN_UNKNOWN_ERROR" };
      }
      // console.info(`refreshTokenError is 10006, => authError is REFRESH_TOKEN_EXPIRED_ERROR`)
      return { ...token, authError: "REFRESH_TOKEN_EXPIRED_ERROR" };
    },
    async session({ session, token }) {
      const { accessToken, email, id, organizationId, authError } = token;

      return {
        ...session,
        accessToken,
        authError,
        email,
        id,
        organizationId,
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
