import { DollarSign, ScrollText } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { OrganizationResponseDto } from "@/api/api-spec";
import useProfileQuery from "@/queries/useProfileQuery";
import useDepartmentQuery from "@/queries/useDepartmentQuery";

interface Props {
  organization: OrganizationResponseDto;
}

export default function PageHeaderAction({ organization }: Props) {
  const { data: profile } = useProfileQuery();
  const { data: department } = useDepartmentQuery(profile?.departmentId ?? "");

  const canViewCustomPricing = department?.viewCustomPricing ?? false;
  const canViewExpensePricing = department?.viewExpensePricing ?? false;

  return (
    <div className="flex gap-2">
      <Button asChild size={"sm"} variant={"outline"}>
        <Link
          href={`/system-management/organizations/${organization.id}/client-notes`}
        >
          <ScrollText className="mr-2 h-4 w-4" />
          View Client Notes
        </Link>
      </Button>
      {canViewCustomPricing && (
        <Button variant={"outline"} size={"sm"} asChild>
          <Link
            href={`/system-management/organizations/${organization.id}/custom-pricings`}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Custom Pricings
          </Link>
        </Button>
      )}
      {organization.isVendor && canViewExpensePricing && (
        <Button variant={"outline"} size={"sm"} asChild>
          <Link
            href={`/system-management/organizations/${organization.id}/expense-pricings`}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Expense Pricings
          </Link>
        </Button>
      )}
    </div>
  );
}
