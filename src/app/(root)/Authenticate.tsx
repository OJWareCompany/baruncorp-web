"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { defaultErrorToast } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import PageLoading from "@/components/PageLoading";

interface Props {
  children: React.ReactNode;
}

export default function Authenticate({ children }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const isSignOutTriggeredRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      session == null ||
      session.authError == null ||
      isSignOutTriggeredRef.current
    ) {
      return;
    }

    const { authError } = session;

    switch (authError) {
      case "REFRESH_TOKEN_ERROR":
        toast({
          title: "Please sign-in again",
          variant: "destructive",
        });
        break;
      case "UNKNOWN_ERROR":
        toast(defaultErrorToast);
        break;
    }

    isSignOutTriggeredRef.current = true; // authError로 로그아웃이 되었을 때, signOut이 trigger 되었다는 값을 기억하게 해서 여러 번 이 코드가 실행되지 않도록 함
    signOut({ redirect: false });
  }, [queryClient, session, status, toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  return children;
}
