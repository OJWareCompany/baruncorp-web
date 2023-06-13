import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      jwt: string;
      name: string;
      email: string;
      image?: string;
    };
  }
}
