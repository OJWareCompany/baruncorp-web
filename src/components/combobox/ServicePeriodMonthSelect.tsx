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
  const defaultPeriodMonth = format(new Date(servicePeriodMonth), "MMM yyyy");

  return (
    <Select onValueChange={onServicePeriodMonthChange}>
      <SelectTrigger>
        <SelectValue placeholder={defaultPeriodMonth} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {organization?.date.map((value) => (
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
