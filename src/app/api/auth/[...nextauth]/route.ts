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
        if (!credentials) {
          // TODO: crendentails 없을 때 처리 필요
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          }
        );

        if (res.ok) {
          const result = await res.json();
          return {
            ...credentials,
            accessToken: result.accessToken,
            name: "elon",
          } as any;
        }
        return null;
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
