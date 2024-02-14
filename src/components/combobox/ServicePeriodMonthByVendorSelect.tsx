"use client";
import { forwardRef } from "react";
import { format } from "date-fns";
import useVendorsToInvoiceQuery from "@/queries/useVendorsToInvoiceQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  vendorId: string;
  servicePeriodMonth: string;
  onServicePeriodMonthChange: (servicePeriodMonth: string) => void;
}

const ServicePeriodMonthByVendorSelect = forwardRef<HTMLButtonElement, Props>(
  ({ vendorId, servicePeriodMonth, onServicePeriodMonthChange }, ref) => {
    const { data: vendors, isLoading: isVendorsQueryLoading } =
      useVendorsToInvoiceQuery();

    const vendor = vendors?.vendorsToInvoice.find(
      (value) => value.organizationId === vendorId
    );

    return (
      <Select
        value={servicePeriodMonth}
        onValueChange={onServicePeriodMonthChange}
      >
        <SelectTrigger
          ref={ref}
          disabled={isVendorsQueryLoading || vendorId === ""}
        >
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {vendor?.dates
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
  }
);
ServicePeriodMonthByVendorSelect.displayName =
  "ServicePeriodMonthByVendorSelect";

export default ServicePeriodMonthByVendorSelect;
