import React, { useEffect } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Time, parseTime } from "@internationalized/date";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { DialogState } from "./SchedulesTable";
import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import TimeField from "@/components/date-time-picker/TimeField";
import { Button } from "@/components/ui/button";
import usePutUserScheduleMutation from "@/mutations/usePutUserScheduleMutation";
import { useToast } from "@/components/ui/use-toast";
import { getSchedulesQueryKey } from "@/queries/useSchedulesQuery";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  schedules: z
    .array(
      z
        .object({
          start: z
            .custom<Time>()
            .nullable()
            .superRefine((value, ctx) => {
              if (value == null) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Start is required",
                });
              }
            }),
          end: z
            .custom<Time>()
            .nullable()
            .superRefine((value, ctx) => {
              if (value == null) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "End is required",
                });
              }
            }),
        })
        .superRefine((values, ctx) => {
          if (values.start == null || values.end == null) {
            return;
          }

          const start = values.start;
          const end = values.end.subtract({ minutes: 1 });

          if (end.compare(start) < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End should be greater than start",
              path: ["end"],
            });
          }
        })
    )
    .superRefine((values, ctx) => {
      for (let i = 1; i < values.length; i++) {
        const start = values[i].start;
        if (start == null) {
          continue;
        }

        for (let j = 0; j < i; j++) {
          const end = values[j].end;
          if (end == null) {
            continue;
          }

          if (end.toString() === "00:00:00") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Start is invalid because end contains the last point, 00:00`,
              path: [`${i}.start`],
            });
            continue;
          }

          if (end.compare(start) > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Start should be greater than or equal to the previous end`,
              path: [`${i}.start`],
            });
            continue;
          }
        }
      }
    }),
});

type FieldValues = z.infer<typeof formSchema>;

interface ScheduleFormProps extends DialogProps {
  state: DialogState;
}

function ScheduleForm({ state, ...dialogProps }: ScheduleFormProps) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      schedules: [
        {
          start: null,
          end: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });
  const { mutateAsync } = usePutUserScheduleMutation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!state.open) {
      return;
    }

    form.reset({
      name: state.initialValue.name,
      schedules:
        state.initialValue.schedules.length === 0
          ? [{ start: null, end: null }]
          : state.initialValue.schedules.map((value) => ({
              start: parseTime(value.start),
              end: parseTime(value.end).add({ minutes: 1 }),
            })),
    });
  }, [form, state]);

  async function onSubmit(values: FieldValues) {
    if (!state.open) {
      return;
    }

    await mutateAsync({
      userId: state.initialValue.userId,
      schedules: values.schedules.map((value) => ({
        start: value.start!.toString(), // superRefine에서 start와 end가 null인 경우에 대해서 validate하기 때문에, 이 시점에서는 무조건 존재한다.
        end: value.end!.subtract({ minutes: 1 }).toString(),
      })),
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getSchedulesQueryKey({}),
        });
        dialogProps.onOpenChange?.(false);
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 422:
        //     if (
        //       error.response?.data.errorCode.includes("40011")
        //     ) {
        //       toast({
        //         title: "Cannot change to Not Started",
        //         variant: "destructive",
        //       });
        //       return;
        //     }
        // }

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
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-0 space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          {fields.map((field, index) => (
            <RowItemsContainer key={field.id}>
              <FormField
                control={form.control}
                name={`schedules.${index}.start`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel required>Start</FormLabel>}
                    <FormControl>
                      <TimeField {...field} hourCycle={24} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`schedules.${index}.end`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel required>End</FormLabel>}
                    <div className="flex flex-row gap-2">
                      <FormControl>
                        <TimeField {...field} hourCycle={24} />
                      </FormControl>
                      {index !== 0 && (
                        <Button
                          variant={"outline"}
                          size={"icon"}
                          className="flex-shrink-0"
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RowItemsContainer>
          ))}
          <Button
            className="w-full"
            variant={"outline"}
            type="button"
            onClick={() => {
              append({ start: null, end: null });
            }}
          >
            Add Time
          </Button>
        </div>
        <LoadingButton
          type="submit"
          className="w-full"
          disabled={!form.formState.isDirty}
          isLoading={form.formState.isSubmitting}
        >
          Save
        </LoadingButton>
      </form>
    </Form>
  );
}

interface Props extends DialogProps {
  state: DialogState;
}

export default function ScheduleDialog({ state, ...dialogProps }: Props) {
  return (
    <Dialog {...dialogProps} open={state.open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule</DialogTitle>
        </DialogHeader>
        <ScheduleForm {...dialogProps} state={state} />
      </DialogContent>
    </Dialog>
  );
}
