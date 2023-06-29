"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import { toast } from "@/hook/use-toast";
import { getTitleAndDescFromStatusCode } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function QueryContext({ children }: Props) {
  return (
    <QueryClientProvider
      client={
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
      }
    >
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}
