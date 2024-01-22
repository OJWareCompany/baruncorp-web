"use client";
import { ScrollText } from "lucide-react";
import Link from "next/link";
import PtoDetails from "./PtoDetails";
import PtosTable from "./PtosTable";
import PtoAnnualSection from "./PtoAnnualSection";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/pto", name: "PTO" }]}
        action={
          <Button asChild size={"sm"} variant={"outline"}>
            <Link href={`/system-management/pto/policy`}>
              <ScrollText className="mr-2 h-4 w-4" />
              View PTO Policy
            </Link>
          </Button>
        }
      />
      <section>
        <PtoDetails />
      </section>
      <section>
        <h2 className="h4 mb-2">History</h2>
        <PtosTable />
      </section>
      <PtoAnnualSection />
    </div>
  );
}
