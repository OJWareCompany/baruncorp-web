"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import api from "@/api";
import { isAxiosErrorWithErrorResponseData } from "@/lib/utils";

const useApi = () => {
  const { data: session, update } = useSession();

  useEffect(() => {
    const requestIntercept = api.instance.interceptors.request.use((config) => {
      if (!config.headers["Authorization"] && session != null) {
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      return config;
    });

    const responseIntercept = api.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          !isAxiosError(error) ||
          !isAxiosErrorWithErrorResponseData(error) ||
          error.config == null ||
          error.response == null
        ) {
          return Promise.reject(error);
        }

        const prevRequestConfig = error.config;
        if (
          error.response.data.errorCode.includes("10005") &&
          !prevRequestConfig.sent
        ) {
          prevRequestConfig.sent = true;
          const newSession = await update();
          if (newSession?.isValid) {
            const prevRequestConfig = error.config;
            prevRequestConfig.headers[
              "Authorization"
            ] = `Bearer ${newSession?.accessToken}`;
            return api.instance(prevRequestConfig);
          }

          return Promise.reject("Session expired");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.instance.interceptors.request.eject(requestIntercept);
      api.instance.interceptors.response.eject(responseIntercept);
    };
  }, [session, update]);

  return api;
};

export default useApi;
