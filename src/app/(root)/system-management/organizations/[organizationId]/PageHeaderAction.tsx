import { DollarSign } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { OrganizationResponseDto } from "@/api";

interface Props {
  organization: OrganizationResponseDto;
}

export default function PageHeaderAction({ organization }: Props) {
  return (
    <div className="flex gap-2">
      <Button variant={"outline"} size={"sm"} asChild>
        <Link
          href={`/system-management/organizations/${organization.id}/custom-pricings`}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Custom Pricings
        </Link>
      </Button>
      {organization.isVendor && (
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
