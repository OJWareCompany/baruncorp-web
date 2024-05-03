"use client";
import { forwardRef } from "react";
import useClientsToInvoiceQuery from "@/queries/useClientsToInvoiceQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatInESTAsMMMYYYY } from "@/lib/utils";

interface Props {
  organizationId: string;
  servicePeriodMonth: string;
  onServicePeriodMonthChange: (servicePeriodMonth: string) => void;
}

const ServicePeriodMonthByOrganizationSelect = forwardRef<
  HTMLButtonElement,
  Props
>(({ organizationId, servicePeriodMonth, onServicePeriodMonthChange }, ref) => {
  const { data: organizations, isLoading: isOrganizationsQueryLoading } =
    useClientsToInvoiceQuery();

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
                {formatInESTAsMMMYYYY(value)}
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
