"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HistoryTable from "./HistoryTable";
import PtoDetails from "./PtoDetails";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import usePtosQuery from "@/queries/usePtosQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import { useToast } from "@/components/ui/use-toast";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { data: ptos, isLoading: isPtosQueryLoading } = usePtosQuery({
    params: {
      userId: session?.id,
      limit: Number.MAX_SAFE_INTEGER,
    },
    enabled: session != null,
  });

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

  if (ptos == null || isPtosQueryLoading || session == null || !isValid) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/my/pto", name: "My PTO" }]} />
      <div className="space-y-6">
        <CollapsibleSection title="History">
          <HistoryTable ptos={ptos} />
        </CollapsibleSection>
        <section>
          <PtoDetails userId={session.id} />
        </section>
      </div>
    </div>
  );
}
