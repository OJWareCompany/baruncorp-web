"use client";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export default function AuthContext({ children }: Props) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      // refetchInterval={60 * 1}
    >
      {children}
    </SessionProvider>
  );
}
