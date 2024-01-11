"use client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { isAxiosError } from "axios";
import { KNOWN_ERROR, defaultErrorToast } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { isError } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  const { toast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (failureCount > 2) {
                return false;
              }

              if (
                isAxiosError<ErrorResponseData>(error) &&
                (error.response?.status === 404 ||
                  error.cause?.name === KNOWN_ERROR)
              ) {
                return false;
              }

              return true;
            },
          },
        },
        queryCache: new QueryCache({
          onError: async (error) => {
            console.error(error);
            if (isError(error) && error.cause === "AUTH_ERROR") {
              return;
            }

            if (isAxiosError<ErrorResponseData>(error)) {
              if (error.cause?.name === KNOWN_ERROR) {
                return;
              }

              if (error.response?.status === 404) {
                toast({
                  title: "Not Found",
                  description: "Could not find requested resource",
                  variant: "destructive",
                });
                return;
              }
            }

            toast(defaultErrorToast);
          },
        }),
        mutationCache: new MutationCache({
          onError: async (error) => {
            console.error(error);
            if (isError(error) && error.cause === "AUTH_ERROR") {
              return;
            }

            if (
              isAxiosError<ErrorResponseData>(error) &&
              error.response &&
              error.response.data.errorCode.filter((value) => value != null)
                .length !== 0
            ) {
              console.error("Error Code:", error.response.data.errorCode);
              return;
            }

            toast(defaultErrorToast);
          },
        }),
      })
  );

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
