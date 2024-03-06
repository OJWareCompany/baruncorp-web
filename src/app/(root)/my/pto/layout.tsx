"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileContext } from "../../ProfileProvider";
import { useToast } from "@/components/ui/use-toast";
import PageLoading from "@/components/PageLoading";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isInitialized, isBarunCorpMember } = useProfileContext();

  useEffect(() => {
    if (isInitialized && !isBarunCorpMember) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [isBarunCorpMember, isInitialized, router, toast]);

  if (!isInitialized || !isBarunCorpMember) {
    return <PageLoading />;
  }

  return children;
}
