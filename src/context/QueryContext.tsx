"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import { signOut } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

function unauthorized(error: unknown) {
  return isAxiosError(error) && error.response?.data?.errorCode === "10005";
}

function retry(failureCount: number, error: unknown) {
  if (failureCount > 2) {
    return false;
  }
  if (unauthorized(error)) {
    return false;
  }
  return true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry },
  },
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (unauthorized(error)) {
        signOut({ redirect: false });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      if (unauthorized(error)) {
        signOut({ redirect: false });
      }
    },
  }),
});

export default function QueryContext({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}
