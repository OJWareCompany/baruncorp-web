"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/components/ui/use-toast";
import useProfileQuery from "@/queries/useProfileQuery";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useProfileQuery();

  const isValid =
    (status === "authenticated" && session.isBarunCorpMember) ||
    (profile && profile.isVendor);

  useEffect(() => {
    if (
      status === "authenticated" &&
      !session.isBarunCorpMember &&
      profile &&
      !profile.isVendor
    ) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [profile, router, session?.isBarunCorpMember, status, toast]);

  if (!isValid) {
    return <PageLoading />;
  }

  return children;
}
