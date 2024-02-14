import TrackingNumbersTable from "./TrackingNumbersTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/tracking-numbers",
            name: "Tracking Numbers",
          },
        ]}
      />
      <TrackingNumbersTable />
    </div>
  );
}
