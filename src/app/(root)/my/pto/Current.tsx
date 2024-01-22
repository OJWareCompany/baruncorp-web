import React from "react";
import { format } from "date-fns";
import RowItemsContainer from "@/components/RowItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PtoPaginatedResponseDto } from "@/api";

interface Props {
  ptos: PtoPaginatedResponseDto;
}

export default function Current({ ptos }: Props) {
  const values = {
    period: "",
    tenure: "",
    totalPto: "",
    availablePto: "",
  };
  if (ptos.items.length !== 0) {
    values.period = `${format(
      new Date(ptos.items[0].startedAt),
      "MM-dd-yyyy"
    )} ~ ${format(new Date(ptos.items[0].endedAt), "MM-dd-yyyy")}`;
    values.tenure = String(ptos.items[0].tenure);
    values.totalPto = String(ptos.items[0].total);
    values.availablePto = String(ptos.items[0].availablePto);
  }

  return (
    <RowItemsContainer>
      <Item>
        <Label>Period</Label>
        <Input value={values.period} disabled />
      </Item>
      <Item>
        <Label>Tenure (Year)</Label>
        <Input value={values.tenure} disabled />
      </Item>
      <Item>
        <Label>Total PTO (Days)</Label>
        <Input value={values.totalPto} disabled />
      </Item>
      <Item>
        <Label>Available PTO (Days)</Label>
        <Input value={values.availablePto} disabled />
      </Item>
    </RowItemsContainer>
  );
}
