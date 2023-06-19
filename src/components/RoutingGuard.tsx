"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function RoutingGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  if (status === "loading") return;

  if (
    status === "authenticated" &&
    (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
  ) {
    router.replace("/");
    return;
  }

  if (
    status === "unauthenticated" &&
    !pathname.startsWith("/signin") &&
    !pathname.startsWith("/signup")
  ) {
    router.replace("/signin");
    return;
  }

  return <>{children}</>;
}
