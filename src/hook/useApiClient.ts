"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import apiClient from "@/api";

const useApiClient = () => {
  const { data: session, update } = useSession();

  useEffect(() => {
    const requestIntercept = apiClient.interceptors.request.use((config) => {
      if (config.method === "post" || config.method === "patch") {
        config.headers["Content-Type"] = "application/json";
      }

      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${session?.accessToken}`;
      }

      return config;
    });

    const responseIntercept = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!isAxiosError<ErrorResponseData>(error) || error.config == null) {
          return Promise.reject(error);
        }

        const prevRequestConfig = error.config;
        if (
          error.response?.data.errorCode.includes("10005") &&
          !prevRequestConfig.sent
        ) {
          prevRequestConfig.sent = true;
          const newSession = await update();
          if (newSession?.isValid) {
            const prevRequestConfig = error.config;
            prevRequestConfig.headers[
              "Authorization"
            ] = `Bearer ${newSession?.accessToken}`;
            return apiClient(prevRequestConfig);
          }

          return Promise.reject("Session expired");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestIntercept);
      apiClient.interceptors.response.eject(responseIntercept);
    };
  }, [session, update]);

  return apiClient;
};

export default useApiClient;
