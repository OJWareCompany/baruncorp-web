"use client";
import { useSession } from "next-auth/react";
import UserDetailPage from "@/components/user-detail-page/UserDetailPage";

export default function Page() {
  const { data: session } = useSession();

  return <UserDetailPage userId={session?.id ?? ""} pageType="PROFILE" />;
}
