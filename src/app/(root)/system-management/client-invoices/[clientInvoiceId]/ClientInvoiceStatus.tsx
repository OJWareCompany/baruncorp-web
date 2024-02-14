import React from "react";
import { InvoiceResponseDto } from "@/api/api-spec";
import { invoiceStatuses } from "@/lib/constants";

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function ClientInvoiceStatus({ clientInvoice }: Props) {
  const status = invoiceStatuses[clientInvoice.status];

  return (
    <div className="flex gap-2">
      <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
        <div className="flex items-center flex-1 gap-2">
          <status.Icon className={`w-4 h-4 ${status.color}`} />
          <span>{status.value}</span>
        </div>
      </div>
    </div>
  );
}
