"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import PageLoading from "@/components/PageLoading";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isValid = status === "authenticated" && session.isBarunCorpMember;

  useEffect(() => {
    if (status === "authenticated" && !session.isBarunCorpMember) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [router, session?.isBarunCorpMember, status, toast]);

  if (!isValid) {
    return <PageLoading />;
  }

  return children;
}
