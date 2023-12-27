import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import {
  SizeForRevisionEnum,
  SizeForRevisionEnumWithEmptyString,
  transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum,
} from "@/lib/constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import usePatchOrderedServiceRevisionSizeMutation from "@/mutations/usePatchOrderedServiceRevisionSizeMutation";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  sizeForRevision: SizeForRevisionEnumWithEmptyString,
});

type FieldValues = z.infer<typeof formSchema>;

interface SizeForRevisionProps {
  sizeForRevision: "Major" | "Minor" | null;
  jobId: string;
  orderedServiceId: string;
}

export default function SizeForRevisionField({
  sizeForRevision,
  jobId,
  orderedServiceId,
}: SizeForRevisionProps) {
  const { toast } = useToast();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sizeForRevision: sizeForRevision ?? "",
    },
  });

  const { mutateAsync } =
    usePatchOrderedServiceRevisionSizeMutation(orderedServiceId);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      sizeForRevision: sizeForRevision ?? "",
    });
  }, [form, sizeForRevision]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      sizeForRevision:
        transformSizeForRevisionEnumWithEmptyStringIntoNullableSizeForRevisionEnum.parse(
          values.sizeForRevision
        ),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getJobQueryKey(jobId),
        });
        toast({
          title: "Success",
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // TODO
        // switch (error.response?.status) {
        //   case 400:
        //     if (error.response?.data.errorCode.includes("40002")) {
        //       toast({
        //         title: "Job can not be updated after invoice is issued",
        //         variant: "destructive",
        //       });
        //     }
        //     break;
        // }
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[150px] flex gap-2"
      >
        <FormField
          control={form.control}
          name="sizeForRevision"
          render={({ field }) => (
            <FormItem className="flex-row flex-1">
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger ref={field.ref} className="h-9">
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
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          size={"icon"}
          variant={"outline"}
          className="w-9 h-9 flex-shrink-0"
          type="submit"
          disabled={!form.formState.isDirty}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
}
