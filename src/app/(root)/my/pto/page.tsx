"use client";
import { useSession } from "next-auth/react";
import HistoryTable from "./HistoryTable";
import PtoDetails from "./PtoDetails";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import usePtosQuery from "@/queries/usePtosQuery";

export default function Page() {
  const { data: session } = useSession();
  const { data: ptos, isLoading: isPtosQueryLoading } = usePtosQuery({
    params: {
      userId: session?.id,
      limit: Number.MAX_SAFE_INTEGER,
    },
    enabled: session != null,
  });

  if (ptos == null || isPtosQueryLoading || session == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/my/pto", name: "My PTO" }]} />
      <div className="space-y-6">
        <section>
          <h4 className="h4 mb-2">History</h4>
          <HistoryTable ptos={ptos} />
        </section>
        <section>
          <PtoDetails userId={session.id} />
        </section>
      </div>
    </div>
  );
}
