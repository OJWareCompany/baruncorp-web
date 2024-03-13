"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileContext } from "../ProfileProvider";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/components/ui/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isBarunCorpMember, isClientCompanyManager } = useProfileContext();

  useEffect(() => {
    if (!isBarunCorpMember && !isClientCompanyManager) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [isBarunCorpMember, isClientCompanyManager, router, toast]);

  if (!isBarunCorpMember && !isClientCompanyManager) {
    return <PageLoading />;
  }

  return children;
}
