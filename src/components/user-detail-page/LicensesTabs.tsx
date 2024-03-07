import React, { useState } from "react";
import LicensesTable from "./LicensesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LicenseTypeEnum } from "@/lib/constants";
import { UserResponseDto } from "@/api/api-spec";

interface LicenseTabsContentProps {
  licenses: UserResponseDto["licenses"];
  value: LicenseTypeEnum;
  userId: string;
  disabled?: boolean;
}

function LicenseTabsContent({
  value,
  licenses,
  userId,
  disabled = false,
}: LicenseTabsContentProps) {
  return (
    <TabsContent value={value}>
      <div className="mt-2">
        <LicensesTable
          licenses={licenses}
          userId={userId}
          disabled={disabled}
        />
      </div>
    </TabsContent>
  );
}

interface Props {
  user: UserResponseDto;
  disabled?: boolean;
}

export default function LicensesTabs({ user, disabled = false }: Props) {
  const [tabsValue, setTabsValue] = useState<LicenseTypeEnum>(
    LicenseTypeEnum.Values.Structural
  );

  return (
    <Tabs
      value={tabsValue}
      onValueChange={(value) => {
        setTabsValue(value as LicenseTypeEnum);
      }}
    >
      <TabsList>
        {LicenseTypeEnum.options.map((value) => (
          <TabsTrigger key={value} value={value}>
            {value}
          </TabsTrigger>
        ))}
      </TabsList>
      <LicenseTabsContent
        value={LicenseTypeEnum.Values.Structural}
        licenses={user.licenses.filter((value) => value.type === "Structural")}
        userId={user.id}
        disabled={disabled}
      />
      <LicenseTabsContent
        value={LicenseTypeEnum.Values.Electrical}
        licenses={user.licenses.filter((value) => value.type === "Electrical")}
        userId={user.id}
        disabled={disabled}
      />
    </Tabs>
  );
}
