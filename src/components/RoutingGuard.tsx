"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  authenticated: boolean;
}

export default function RoutingGuard({ children, authenticated }: Props) {
  const router = useRouter();
  const { status } = useSession();

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

  if (
    status === "loading" ||
    (status === "authenticated" && !authenticated) ||
    (status === "unauthenticated" && authenticated)
  ) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return children;
}
