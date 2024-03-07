"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileContext } from "../ProfileProvider";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/components/ui/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isBarunCorpMember, isContractor } = useProfileContext();

  useEffect(() => {
    if (!isBarunCorpMember && !isContractor) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [isBarunCorpMember, isContractor, router, toast]);

  if (!isBarunCorpMember && !isContractor) {
    return <PageLoading />;
  }

  return children;
}
