"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import api from "@/api";

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
          !isAxiosError<ErrorResponseData>(error) ||
          error.response?.status !== 401
        ) {
          return Promise.reject(error);
        }

        if (error.response?.data.errorCode.includes("10005")) {
          const newSession = await update();
          if (newSession != null && newSession.authError == null) {
            return api.instance({
              ...error.config,
              headers: {
                Authorization: `Bearer ${newSession.accessToken}`,
              },
            });
          }
        }

        return Promise.reject(
          new Error("Authentication Error", { cause: "AUTH_ERROR" })
        );
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
