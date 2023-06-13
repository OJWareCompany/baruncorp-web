import { NextAuthOptions } from "next-auth";
/**
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
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
        name: {
          label: "email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as any;

        /**
         * TODO Backend API Integration
         */

        /**
         * TODO Error Message Setting from Backend Server
         */

        if (email === "ejsvk3284@kakao.com") {
          throw new Error("Invalid email address or password");
        }

        if (email === "ejsvk3284@kakao.co") {
          const user: any = {
            email: "ejsvk3284@kakao.com",
            name: "sangwon",
            jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
          };
          // any를 사용한 이유는 authrize 함수에서 리턴해야 하는게 Awaitable<User | null> 타입인데 여기서 User 타입을 내가 커스텀할 수 있는지 찾아봐야함...
          return user;
        } else {
          return null;
        }
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
      session.user.jwt = token.jwt as string;
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
