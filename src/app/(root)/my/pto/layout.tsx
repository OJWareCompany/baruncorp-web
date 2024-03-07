"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileContext } from "../../ProfileProvider";
import { useToast } from "@/components/ui/use-toast";
import PageLoading from "@/components/PageLoading";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isBarunCorpMember } = useProfileContext();

  useEffect(() => {
    if (!isBarunCorpMember) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
    }
  }, [isBarunCorpMember, , router, toast]);

  if (!isBarunCorpMember) {
    return <PageLoading />;
  }

  return children;
}
