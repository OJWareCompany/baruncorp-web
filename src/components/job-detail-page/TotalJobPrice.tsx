import { AffixInput } from "../AffixInput";
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
    <AffixInput
      prefixElement={<span>Total Job Price: </span>}
      value={value}
      readOnly
    />
  );
}
