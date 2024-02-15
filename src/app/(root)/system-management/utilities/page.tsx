import NewUtilitySheet from "./NewUtilitySheet";
import UtilitiesTable from "./UtilitiesTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/utilities", name: "Utilities" }]}
        action={<NewUtilitySheet />}
      />
      <UtilitiesTable />
    </div>
  );
}
