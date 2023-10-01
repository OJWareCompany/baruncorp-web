"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { defaultErrorToast } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  children: React.ReactNode;
}

export default function Authenticate({ children }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session == null || session.authError == null) {
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

    signOut({ redirect: false });
  }, [session, toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

  return children;
}
