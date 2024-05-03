"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (status === "authenticated") {
      if (
        session?.authError === "REFRESH_TOKEN_ERROR" &&
        !isSignOutTriggeredRef.current
      ) {
        toast({
          title: "Please sign-in again",
          variant: "destructive",
        });
        isSignOutTriggeredRef.current = true;
        signOut({ redirect: false, callbackUrl: "/signin" });
      } else if (session?.authError === "UNKNOWN_ERROR") {
        toast(defaultErrorToast);
      }
    }
  }, [session, isSignOutTriggeredRef, toast, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

  if (session && status !== "authenticated") {
    signOut({ redirect: false, callbackUrl: "/signin" });
    return null;
  }

  if (status === "loading" || status === "unauthenticated") {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  return children;
}
