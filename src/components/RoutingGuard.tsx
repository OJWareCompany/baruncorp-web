"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  authenticated: boolean;
}

export default function RoutingGuard({ children, authenticated }: Props) {
  const router = useRouter();
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && !authenticated) {
    router.replace("/");
    return;
  }

  if (status === "unauthenticated" && authenticated) {
    router.replace("/signin");
    return;
  }

  return children;
}
