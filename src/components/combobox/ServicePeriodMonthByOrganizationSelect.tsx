"use client";
import { forwardRef } from "react";

import { format } from "date-fns";
import useInvoiceOrganizationsQuery from "@/queries/useOrganizationsToInvoiceQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  organizationId: string;
  servicePeriodMonth: string;
  onServicePeriodMonthChange: (servicePeriodMonth: string) => void;
}

const ServicePeriodMonthByOrganizationSelect = forwardRef<
  HTMLButtonElement,
  Props
>(({ organizationId, servicePeriodMonth, onServicePeriodMonthChange }, ref) => {
  /**
   * Query
   */
  const { data: organizations, isLoading: isOrganizationsQueryLoading } =
    useInvoiceOrganizationsQuery();

  const organization = organizations?.clientToInvoices.find(
    (value) => value.id === organizationId
  );

  return (
    <Select
      value={servicePeriodMonth}
      onValueChange={onServicePeriodMonthChange}
    >
      <SelectTrigger
        ref={ref}
        disabled={isOrganizationsQueryLoading || organizationId === ""}
      >
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {organization?.date
            .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
            .map((value) => (
              <SelectItem key={value} value={value}>
                {format(new Date(value.slice(0, 7)), "MMM yyyy")}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
ServicePeriodMonthByOrganizationSelect.displayName =
  "ServicePeriodMonthByOrganizationSelect";

export default ServicePeriodMonthByOrganizationSelect;
