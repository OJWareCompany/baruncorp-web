import { AffixInput } from "../AffixInput";
import Item from "../Item";
import { Label } from "../ui/label";
import { JobResponseDto } from "@/api/api-spec";

interface Props {
  job: JobResponseDto;
}

export default function TotalJobPrice({ job }: Props) {
  const value = job.orderedServices.reduce(
    (prev, cur) => prev + (cur.price ?? 0),
    0
  );

  return (
    <Item>
      <Label>Total Amount</Label>
      <AffixInput
        prefixElement={<span className="text-muted-foreground">$</span>}
        value={Number(value.toFixed(2))}
        readOnly
      />
    </Item>
  );
}
