"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import api from "@/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  NETWORK_ERROR,
  signUpUrlRegExp,
  userInvitationUrlRegExp,
} from "@/lib/constants";
import { useCommonStore } from "@/store/useCommonStore";

const useApi = () => {
  const { data: session, update, status } = useSession();
  const { triggeredAuthError, authStatus } = useAuthStore();
  const { triggeredNetworkError, setTriggeredNetworkError } = useCommonStore();

  useEffect(() => {
    const requestIntercept = api.instance.interceptors.request.use((config) => {
      const requestUrl = config?.url;
      if (!requestUrl) {
        return Promise.reject(
          new Error("Request Error", { cause: "INVALID_REQUEST_URL" })
        );
      }

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
        (triggeredAuthError ||
          status === "unauthenticated" ||
          authStatus === "unauthenticated") &&
        !signUpUrlRegExp.test(requestUrl) &&
        !userInvitationUrlRegExp.test(requestUrl)
      ) {
        console.info(`requestUrl: ${requestUrl}`);
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
        if (triggeredNetworkError) setTriggeredNetworkError(false); // 네트워크 에러 트리거 상태였는데 요청이 정상적으로 수행되면 false로 값을 바꿈
        return response;
      },
      async (error) => {
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
          // 네트워크 에러 혹은 nginx에서 던져주는 504 에러인 경우
          if (error.code === NETWORK_ERROR || error.response.status === 504) {
            setTriggeredNetworkError(true);
          }
          // 네트워크 에러 혹은 nginx에서 504를 던져주진 않지만 triggeredNetworkError가 true인 경우 (결국 에러 상태가 아니므로 false로 만들어야 함)
          // 네트워크 에러 트리거 상태였는데 요청이 정상적으로 수행되면 false로 값을 바꿈
          if (
            error.code !== NETWORK_ERROR &&
            error.response.status !== 504 &&
            triggeredNetworkError
          ) {
            setTriggeredNetworkError(false);
          }
          return Promise.reject(error);
        }

        // console.info(`Error Response: ${error.config?.method ?? 'method not found'} ${error.config?.url ?? 'url not found'} ${error?.response?.status ?? 'status not found'} ${error?.response?.statusText ?? 'statusText not found'}`)
        // console.info(error)

        if (error.response?.data.errorCode.includes("10005")) {
          const newSession = await update(); // jwt callback 호출 -> session이 변경되기 때문에 Authenticate 컴포넌트 리렌더링
          if (newSession != null && newSession.authError == null) {
            console.info("Token Update Success...!!!");
            return api.instance({
              ...error.config,
              headers: {
                Authorization: `Bearer ${newSession.accessToken}`,
              },
            });
          }
          console.info(
            `Token Update Failed Because of ${newSession?.authError}...!!!`
          );
          console.info(
            `Reject AuthenticationError (cause: TOKEN_UPDATE_FAILED)`
          );
          return Promise.reject(
            new Error("Authentication Error", { cause: "TOKEN_UPDATE_FAILED" })
          );
        }

        console.info(`Reject AuthenticationError (cause: UNKNOWN_AUTH_ERROR)`);
        return Promise.reject(
          new Error("Authentication Error", { cause: "UNKNOWN_AUTH_ERROR" })
        );
      }
    );

    return () => {
      api.instance.interceptors.request.eject(requestIntercept);
      api.instance.interceptors.response.eject(responseIntercept);
    };
  }, [session, update, triggeredNetworkError]);

  return api;
};

export default useApi;
