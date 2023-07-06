"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";
import { isAxiosError } from "axios";
import { SessionProvider } from "next-auth/react";
import { toast } from "@/hook/use-toast";
import { getTitleAndDescFromStatusCode } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: async (error) => {
            if (!isAxiosError<ErrorResponseData>(error)) {
              return;
            }

            const { title, description } = getTitleAndDescFromStatusCode(
              error.response?.data.statusCode
            );

            toast({
              title,
              description,
              variant: "destructive",
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: async (error) => {
            if (!isAxiosError<ErrorResponseData>(error)) {
              return;
            }

            const { title, description } = getTitleAndDescFromStatusCode(
              error.response?.data.statusCode
            );

            toast({
              title,
              description,
              variant: "destructive",
            });
          },
        }),
      })
  );

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
