"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import { signOut } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

function retry(failureCount: number, error: unknown) {
  if (failureCount > 2) {
    return false;
  }
  if (isAxiosError(error) && error.response?.data?.errorCode === "10005") {
    signOut({ redirect: false });
    return false;
  }
  return true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry },
    mutations: { retry },
  },
});

export default function QueryContext({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}
