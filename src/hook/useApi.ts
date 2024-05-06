"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import api from "@/api";
import { useAuthStore } from "@/store/useAuthStore";

const useApi = () => {
  const { data: session, update, status } = useSession();
  const { triggeredAuthError, authStatus } = useAuthStore();

  useEffect(() => {
    const requestIntercept = api.instance.interceptors.request.use((config) => {
      /**
       * Request가 들어왔는데 Access Token 혹은 Refresh Token이 모두 만료된 경우 API 요청을 못하도록 Block
       * - triggeredAuthError
       *  - 값이 true면 authError가 발생한 상태
       *  - authError
       *  - 이 값은 Authenticate 컴포넌트에서 조작됨
       * - status === 'unauthenticated'
       *  - next 서버에 대한 토큰이 만료된 상태
       * - authStatus === 'unauthenticated'
       *  - 로그아웃된 상태
       */
      if (
        triggeredAuthError ||
        status === "unauthenticated" ||
        authStatus === "unauthenticated"
      ) {
        // console.info(`Promise.reject(new Error('Authentication Error', { cause: 'UNAUTHENTICATED_STATUS' }));`)
        // console.info(`triggeredAuthError: ${triggeredAuthError}`)
        // console.info(`status: ${status}`)
        // console.info(`authStatus: ${authStatus}`)
        return Promise.reject(
          new Error("Authentication Error", { cause: "UNAUTHENTICATED_STATUS" })
        );
      }

      if (!config.headers["Authorization"] && session != null) {
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      // console.info(`API Call: ${config?.method ?? 'method not found'} ${config?.url ?? 'url not found'}`)

      return config;
    });

    const responseIntercept = api.instance.interceptors.response.use(
      (response) => {
        // console.info(`API Response: ${response.config?.method ?? 'method not found'} ${response.config?.url ?? 'url not found'} ${response?.status ?? 'status not found'} ${response?.statusText ?? 'statusText not found'}`)
        return response;
      },
      async (error) => {
        // console.info(`responseIntercept.onRejected`)

        /**
         * request interceptor에서 Block된 요청인 경우
         */
        if (error.cause === "UNAUTHENTICATED_STATUS") {
          // console.info('api error because of error.cause is UNAUTHENTICATED_STATUS')
          return Promise.reject(error);
        }

        if (
          !isAxiosError<ErrorResponseData>(error) ||
          error.response?.status !== 401
        ) {
          return Promise.reject(error);
        }

        // console.info(`Error Response: ${error.config?.method ?? 'method not found'} ${error.config?.url ?? 'url not found'} ${error?.response?.status ?? 'status not found'} ${error?.response?.statusText ?? 'statusText not found'}`)
        // console.info(error)

        if (error.response?.data.errorCode.includes("10005")) {
          const newSession = await update();
          if (newSession != null && newSession.authError == null) {
            // console.info('Token Update Success...!!!')
            return api.instance({
              ...error.config,
              headers: {
                Authorization: `Bearer ${newSession.accessToken}`,
              },
            });
          }
          // console.info(`Token Update Failed...!!!`)
        }

        // console.info(`Promise.reject(new Error("Authentication Error", { cause: "TOKEN_UPDATE_FAILED" }))`)
        return Promise.reject(
          new Error("Authentication Error", { cause: "TOKEN_UPDATE_FAILED" })
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
