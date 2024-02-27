import React from "react";
import { InvoiceResponseDto } from "@/api/api-spec";
import { invoiceStatuses } from "@/lib/constants";

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function ClientInvoiceStatus({ clientInvoice }: Props) {
  const status = invoiceStatuses[clientInvoice.status];

  return (
    <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md text-sm border border-input bg-background">
      <status.Icon className={`w-4 h-4 ${status.color}`} />
      <span>{status.value}</span>
    </div>
  );
}
