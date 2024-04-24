"use client";
import { format } from "date-fns";
import useClientsToInvoiceQuery from "@/queries/useClientsToInvoiceQuery";
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

const ServicePeriodMonthSelect = ({
  organizationId,
  servicePeriodMonth,
  onServicePeriodMonthChange,
}: Props) => {
  const { data: organizations } = useClientsToInvoiceQuery();

  const organization = organizations?.clientToInvoices.find(
    (value) => value.id === organizationId
  );

  return (
    <Select onValueChange={onServicePeriodMonthChange}>
      <SelectTrigger>
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
};
ServicePeriodMonthSelect.displayName = "ServicePeriodMonthSelect";

export default ServicePeriodMonthSelect;
