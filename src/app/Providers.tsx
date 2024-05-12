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
import InitializeAuthStatus from "./(root)/InitializeAuthStatus";
import { KNOWN_ERROR, NETWORK_ERROR, defaultErrorToast } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { isValidServerErrorCode, isError } from "@/lib/utils";
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
            retry: (failureCount, error) => {
              if (failureCount > 2) {
                return false;
              }

              if (
                isAxiosError<ErrorResponseData>(error) &&
                (error.response?.status === 404 ||
                  error.cause?.name === KNOWN_ERROR ||
                  error.code === NETWORK_ERROR) // 네트워크 에러인 경우 서버 죽은 걸로 판단하고 retry 하지 않음
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
            /**
             * 이 조건에 걸리는 애들은 전부 Authentication Error
             * 아래 로직으로 흘려보내지 않는 이유는 세션 만료 되면서 'Please sign-in again' 메시지를 띄워줄 것이기 때문
             */
            if (
              isError(error) &&
              (error.cause === "TOKEN_UPDATE_FAILED" ||
                error.cause === "UNAUTHENTICATED_STATUS" ||
                error.cause === "UNKNOWN_AUTH_ERROR")
            ) {
              // console.info(`queryCache.onError.cause: ${error.cause}`);
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
            /**
             * 이 조건에 걸리는 애들은 전부 Authentication Error
             * 아래 로직으로 흘려보내지 않는 이유는 세션 만료 되면서 'Please sign-in again' 메시지를 띄워줄 것이기 때문
             */
            if (
              isError(error) &&
              (error.cause === "TOKEN_UPDATE_FAILED" ||
                error.cause === "UNAUTHENTICATED_STATUS" ||
                error.cause === "UNKNOWN_AUTH_ERROR")
            ) {
              // console.info(`mutationCache.onError.cause: ${error.cause}`);
              return;
            }

            if (
              isAxiosError<FileServerErrorResponseData | ErrorResponseData>(
                error
              ) &&
              error.response &&
              isValidServerErrorCode(error.response.data.errorCode)
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
        <InitializeAuthStatus />
      </QueryClientProvider>
    </SessionProvider>
  );
}
