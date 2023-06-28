"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@/hook/use-toast";

interface Props {
  children: React.ReactNode;
  authenticated: boolean;
}

export default function RoutingGuard({ children, authenticated }: Props) {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (!authenticated || session == null || session.isValid) {
      return;
    }

    const { authError } = session;

    switch (authError) {
      case "REFRESH_TOKEN_ERROR":
        toast({
          title: "Expired session",
          description: "Please sign in again.",
          variant: "destructive",
        });
        break;
      case "UNKNOWN_ERROR":
        toast({
          title: "Something went wrong",
          description:
            "Please try again in a few minutes. If the problem persists, please contact the Barun Corp Manager.",
          variant: "destructive",
        });
        break;
    }

    signOut({ redirect: false });
  }, [authenticated, session]);

  useEffect(() => {
    if (status === "authenticated" && !authenticated) {
      router.replace("/");
      return;
    }

    if (status === "unauthenticated" && authenticated) {
      router.replace("/signin");
      return;
    }
  }, [authenticated, router, status]);

  return children;
}
