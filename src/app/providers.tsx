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
import {
  DEFAULT_ERROR_TOAST_DESCRIPTION,
  DEFAULT_ERROR_TOAST_TITLE,
  SERVER_ERROR_TOAST_TITLE,
} from "@/lib/constants";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
        queryCache: new QueryCache({
          onError: async (error) => {
            if (!isAxiosError<ErrorResponseData>(error)) {
              console.error(error);
              toast({
                title: DEFAULT_ERROR_TOAST_TITLE,
                description: DEFAULT_ERROR_TOAST_DESCRIPTION,
                variant: "destructive",
              });
              return;
            }

            // TODO: check
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
              console.error(error);
              toast({
                title: DEFAULT_ERROR_TOAST_TITLE,
                description: DEFAULT_ERROR_TOAST_DESCRIPTION,
                variant: "destructive",
              });
              return;
            }

            if (error.response && error.response.status >= 500) {
              console.error(error);
              toast({
                title: SERVER_ERROR_TOAST_TITLE,
                description: DEFAULT_ERROR_TOAST_DESCRIPTION,
                variant: "destructive",
              });
              return;
            }

            toast({
              title: error.response?.data.message ?? DEFAULT_ERROR_TOAST_TITLE,
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
