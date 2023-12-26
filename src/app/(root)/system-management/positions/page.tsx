import NewPositionSheet from "./NewPositionSheet";
import PositionsTable from "./PositionsTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/positions", name: "Positions" }]}
        action={<NewPositionSheet />}
      />
      <PositionsTable />
    </div>
  );
}
