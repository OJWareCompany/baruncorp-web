"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoading from "@/components/PageLoading";

interface Props {
  children: React.ReactNode;
}

export default function Unauthenticate({ children }: Props) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return <PageLoading isPageHeaderPlaceholder={false} />;
  }

  return children;
}
