"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import useAuthenticatationUpdate from "@/hook/useAuthenticatationUpdate";

interface Props {
  children: React.ReactNode;
}

export default function Authenticate({ children }: Props) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { authStatus, triggeredAuthError, setTriggeredAuthError } =
    useAuthStore();
  const { logoutOnAuthError } = useAuthenticatationUpdate();

  /**
   * @OnAuthError
   * authError가 발생한 경우에 실행
   */
  useEffect(() => {
    if (session == null || session.authError == null) {
      return;
    }

    /**
     * - triggeredAuthError is false: authError가 발생하지 않은 상태
     * - authStatus is authenticated: logout 되지 않은 상태 (logout 상태면 unauthenticated 임)
     * 즉 첫 번째 authError가 발생하고 아직 logout 되지 않은 상태일 때 실행됨
     */
    if (!triggeredAuthError && authStatus !== "unauthenticated") {
      setTriggeredAuthError(true); // authError가 발생한 상태로 변경
      logoutOnAuthError(); // authError가 발생한 경우의 logout 함수 실행
    }
  }, [queryClient, session, triggeredAuthError, authStatus]);

  /**
   * @OnUnauthenticatedStatus
   * useSession.status의 상태를 신뢰할 수 없기 때문에 authStatus 상태를 이용해서 triggeredAuthError를 제어함
   * 신뢰할 수 없는 이유:
   *   - signout 메서드를 호출해도 status의 상태가 unauthenticated로 변경되지 않는 경우 존재
   *   - 이런 경우에 앱을 reload 해줘야 함
   */
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      console.info("authStatus to unauthenticated");
      setTriggeredAuthError(false);
    }
  }, [authStatus]);

  return children;
}
