"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LicensesTable from "./LicensesTable";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LicenseTypeEnum } from "@/lib/constants";

interface LicenseTabsContentProps {
  value: LicenseTypeEnum;
}

function LicenseTabsContent({ value }: LicenseTabsContentProps) {
  return (
    <TabsContent value={value}>
      <div className="mt-4">
        <LicensesTable type={value} />
      </div>
    </TabsContent>
  );
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeSearchParamParseResult = LicenseTypeEnum.safeParse(
    searchParams.get("type")
  );
  const typeSearchParam = typeSearchParamParseResult.success
    ? typeSearchParamParseResult.data
    : LicenseTypeEnum.Values.Structural;

  return (
    <div className="flex flex-col">
      <PageHeader
        items={[{ href: "/system-management/licenses", name: "Licenses" }]}
      />
      <Tabs
        value={typeSearchParam}
        onValueChange={(value) => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("type", value);
          router.replace(`${pathname}?${newSearchParams.toString()}`, {
            scroll: false,
          });
        }}
      >
        <TabsList>
          {LicenseTypeEnum.options.map((value) => (
            <TabsTrigger key={value} value={value}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        <LicenseTabsContent value={LicenseTypeEnum.Values.Structural} />
        <LicenseTabsContent value={LicenseTypeEnum.Values.Electrical} />
      </Tabs>
    </div>
  );
}
