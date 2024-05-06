"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
// import PageLoading from "@/components/PageLoading";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  children: React.ReactNode;
}

export default function Authenticate({ children }: Props) {
  const router = useRouter();

  const { data: session, status } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authStatus, setAuthStatus } = useAuthStore();

  const { triggeredAuthError, setTriggeredAuthError } = useAuthStore();

  useEffect(() => {
    // console.info(
    //   `userEffectReRender[queryClient, session, toast, triggeredAuthError]`
    // );
    if (
      session == null ||
      session.authError == null ||
      /**
       * @TODO ACCESS_TOKEN_EXPIRED_ERROR 조건 여기 없어도 되는지 테스트
       */
      session.authError === "ACCESS_TOKEN_EXPIRED_ERROR" // 분명 이 조건을 건 이유가 있었는데 기억이 안난다...
    ) {
      return;
    }

    // const { authError } = session;
    // console.info(`session: ${JSON.stringify(session, null, 2)}`);
    // console.info(`authError: ${authError}`);

    /**
     * triggeredAuthError가 true이면 toast 메시지를 더 보여주지 않아야 함!
     */
    if (!triggeredAuthError && authStatus !== "unauthenticated") {
      // switch (authError) {
      //   case "REFRESH_TOKEN_EXPIRED_ERROR":
      //     console.error(`REFRESH_TOKEN_EXPIRED_ERROR`);
      //     break;
      //   case "REFRESH_TOKEN_UNKNOWN_ERROR":
      //     console.error(`REFRESH_TOKEN_UNKNOWN_ERROR`);
      //     break;
      //   default:
      //     console.error(`UNKNOWN_AUTH_ERROR`);
      // }
      setTriggeredAuthError(true);
      // console.info("before signout");
      signOut({ redirect: false }).then(() => {
        // console.info("after signout");
        setAuthStatus("unauthenticated");
        toast({
          title: "Please sign-in again",
          variant: "destructive",
        });
        setTimeout(() => {
          router.refresh();
          router.push("/signin");
        }, 250);
      });
    }
  }, [queryClient, session, toast, triggeredAuthError, status]);

  /**
   * status가 unauthenticated란 것의 의미 =>
   * signout 이후 상태가 unauthenticated로 바뀔 때 까지 시간이 좀 걸림
   * signout이 된 이후면 setTriggeredAuthError의 값이 false로 바로 변경됨
   * 즉 실행 순서
   * 1. signout 실행
   * 2. setTriggeredAuthError set to false
   * 3. status set to unauthenticated
   *
   * setTriggeredAuthError 값이 true인 동안은 toast가 보이면 안됨
   */
  useEffect(() => {
    /**
     * 사실 status는 체크 안해도 됨
     * status 상태를 신뢰할 수 없는 경우가 있어서 authStatus 상태를 사용하는 것
     */
    if (status === "unauthenticated" || authStatus === "unauthenticated") {
      setTriggeredAuthError(false);
    }
  }, [status, authStatus]);

  /**
   * 이건 원하는대로 제어가 안되서 일단 제외
   */
  // if (
  //   triggeredAuthError ||
  //   (authStatus === "unauthenticated" && pathname !== "/signin")
  // ) {
  //   console.log(`triggeredAuthError: ${triggeredAuthError}`);
  //   console.log(`authStatus: ${authStatus}`);
  //   console.log(`pathname: ${pathname}`);
  //   return <PageLoading isPageHeaderPlaceholder={false} />;
  // }

  return children;
}
