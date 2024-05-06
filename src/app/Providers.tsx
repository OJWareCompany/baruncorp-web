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
import { KNOWN_ERROR, defaultErrorToast } from "@/lib/constants";
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
            /**
             * axios(useApi)로 부터 넘어온 에러가 TOKEN_UPDATE_FAILED 혹은 UNAUTHENTICATED_STATUS 라면 얼리 리턴
             * 근데 여기 안걸리는 것 같은데?? 이상하다...
             * @TODO 의미 없는 코드인지 확인 필요
             */
            if (
              isError(error) &&
              (error.cause === "TOKEN_UPDATE_FAILED" ||
                error.cause === "UNAUTHENTICATED_STATUS")
            ) {
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
             * axios(useApi)로 부터 넘어온 에러가 TOKEN_UPDATE_FAILED 혹은 UNAUTHENTICATED_STATUS 라면 얼리 리턴
             * 근데 여기 안걸리는 것 같은데?? 이상하다...
             * @TODO 의미 없는 코드인지 확인 필요
             */
            if (
              isError(error) &&
              (error.cause === "TOKEN_UPDATE_FAILED" ||
                error.cause === "UNAUTHENTICATED_STATUS")
            ) {
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
