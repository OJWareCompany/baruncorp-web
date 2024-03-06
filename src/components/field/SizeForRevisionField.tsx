import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  SizeForRevisionEnum,
  transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum,
} from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePatchOrderedServiceRevisionSizeMutation from "@/mutations/usePatchOrderedServiceRevisionSizeMutation";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { useToast } from "@/components/ui/use-toast";
import { getJobHistoriesQueryKey } from "@/queries/useJobHistoriesQuery";

interface SizeForRevisionProps {
  sizeForRevision: "Major" | "Minor" | null;
  jobId: string;
  orderedServiceId: string;
  disabled?: boolean;
}

export default function SizeForRevisionField({
  sizeForRevision,
  jobId,
  orderedServiceId,
  disabled = false,
}: SizeForRevisionProps) {
  const { toast } = useToast();

  const { mutateAsync } =
    usePatchOrderedServiceRevisionSizeMutation(orderedServiceId);
  const queryClient = useQueryClient();

  return (
    <Select
      value={sizeForRevision ?? ""}
      onValueChange={(newValue) => {
        mutateAsync({
          sizeForRevision:
            transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum.parse(
              newValue
            ),
        })
          .then(() => {
            queryClient.invalidateQueries({
              queryKey: getJobQueryKey(jobId),
            });
            queryClient.invalidateQueries({
              queryKey: getJobHistoriesQueryKey({ jobId }),
            });
            toast({
              title: "Success",
            });
          })
          .catch((error: AxiosError<ErrorResponseData>) => {
            switch (error.response?.status) {
              case 400:
                if (error.response?.data.errorCode.includes("40002")) {
                  toast({
                    title: "Job cannot be updated after invoice is issued",
                    variant: "destructive",
                  });
                  return;
                }
            }

            if (
              error.response &&
              error.response.data.errorCode.filter((value) => value != null)
                .length !== 0
            ) {
              toast({
                title: error.response.data.message,
                variant: "destructive",
              });
              return;
            }
          });
      }}
      disabled={disabled}
    >
      <SelectTrigger className="-ml-[9px] text-xs px-2 h-8 py-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SizeForRevisionEnum.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
