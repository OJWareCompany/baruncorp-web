"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileContext } from "../ProfileProvider";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/components/ui/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isInitialized, isBarunCorpMember, isContractor } =
    useProfileContext();

  useEffect(() => {
    if (isInitialized && !isBarunCorpMember && !isContractor) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [isBarunCorpMember, isContractor, isInitialized, router, toast]);

  if (!isInitialized || (!isBarunCorpMember && !isContractor)) {
    return <PageLoading />;
  }

  return children;
}
