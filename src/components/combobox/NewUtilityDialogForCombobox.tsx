"use client";

import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import LoadingButton from "../LoadingButton";
import { useToast } from "../ui/use-toast";
import AllUtilitiesCombobox from "./AllUtilitiesCombobox";
import usePatchUtilityNoteMutation from "@/mutations/usePatchUtilityNoteMutation";
import { StateName, stateNameAbbreviationMap } from "@/lib/constants";
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
import { getUtilitiesQueryKey } from "@/queries/useUtilitiesQuery";
import usePostUtilityMutation from "@/mutations/usePostUtilityMutation";

interface Props extends DialogProps {
  state: string;
  onUtilityIdChange: (newUtilityId: string) => void;
}

export default function NewUtilityDialogForCombobox({
  onUtilityIdChange,
  state,
  ...dialogProps
}: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isExistingStep, setIsExistingStep] = useState(true);

  const usePatchUtilityNoteMutationResult = usePatchUtilityNoteMutation();
  const usePostUtilityMutationResult = usePostUtilityMutation();

  const formSchema = useMemo(
    () =>
      z.object({
        state: z.string().trim().min(1, { message: "State is required" }),
        existingUtility: z
          .object({
            id: z.string().trim(),
            name: z.string().trim(),
            notes: z.string().trim(),
            stateAbbreviations: z.string().array(),
          })
          .superRefine((value, ctx) => {
            if (isExistingStep && value.id.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Existing Utility is required",
              });
            }
          }),
        name: z
          .string()
          .trim()
          .superRefine((value, ctx) => {
            if (!isExistingStep && value.length === 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Name is required",
              });
            }
          }),
      }),
    [isExistingStep]
  );

  type FieldValues = z.infer<typeof formSchema>;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state,
      existingUtility: {
        id: "",
        name: "",
        notes: "",
        stateAbbreviations: [],
      },
      name: "",
    },
  });

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      (usePatchUtilityNoteMutationResult.isSuccess ||
        usePostUtilityMutationResult.isSuccess)
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePatchUtilityNoteMutationResult.isSuccess,
    usePostUtilityMutationResult.isSuccess,
  ]);

  useEffect(() => {
    // dialog를 닫을 때, 각 request에 대한 mutation의 state를 초기화한다.
    // 일반적으로는 이 useEffect가 필요하지 않다. form을 submit할 때 하나의 request로 처리를 하기 때문에 그 mutation의 isSuccess state는 계속 업데이트될 것이기 때문에 위의 useEffect가 잘 동작한다.
    // 그런데 이 form을 submit할 때는 경우에 따라 두 개의 request로 처리를 하기 때문에 state를 초기화해주지 않으면 원하지 않는 상황에서 위의 useEffect가 동작하게 된다.
    if (!dialogProps.open) {
      usePatchUtilityNoteMutationResult.reset();
      usePostUtilityMutationResult.reset();
    }
  }, [
    dialogProps.open,
    usePatchUtilityNoteMutationResult,
    usePostUtilityMutationResult,
  ]);

  const newAbbr = stateNameAbbreviationMap[state.toUpperCase() as StateName];

  async function onSubmit(values: FieldValues) {
    if (isExistingStep) {
      await usePatchUtilityNoteMutationResult
        .mutateAsync({
          utilityId: values.existingUtility.id,
          name: values.existingUtility.name,
          notes: values.existingUtility.notes,
          stateAbbreviations: [
            ...values.existingUtility.stateAbbreviations,
            newAbbr,
          ],
        })
        .then(() => {
          toast({ title: "Success" });
          queryClient.invalidateQueries({
            queryKey: getUtilitiesQueryKey({
              limit: Number.MAX_SAFE_INTEGER,
              stateAbbreviation: newAbbr,
            }),
          });
          dialogProps.onOpenChange?.(false);
          onUtilityIdChange(values.existingUtility.id);
          setIsExistingStep(true);
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
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
    } else {
      await usePostUtilityMutationResult
        .mutateAsync({
          name: values.name,
          notes: "",
          stateAbbreviations: [newAbbr],
        })
        .then(({ id }) => {
          toast({ title: "Success" });
          queryClient.invalidateQueries({
            queryKey: getUtilitiesQueryKey({
              limit: Number.MAX_SAFE_INTEGER,
              stateAbbreviation: newAbbr,
            }),
          });
          dialogProps.onOpenChange?.(false);
          onUtilityIdChange(id);
          setIsExistingStep(true);
        })
        .catch((error: AxiosError<ErrorResponseData>) => {
          switch (error.response?.status) {
            case 404:
              if (error.response?.data.errorCode.includes("21503")) {
                form.setError(
                  "name",
                  {
                    message: `${values.name} already exists`,
                  },
                  { shouldFocus: true }
                );
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
    }
  }

  const stepButton = (
    <Button
      variant={"outline"}
      className="w-full"
      onClick={() => {
        setIsExistingStep((prev) => !prev);
        form.reset();
      }}
      type="button"
    >
      {isExistingStep ? "Utility Not Found" : "Select from Existing"}
    </Button>
  );

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Utility</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();

              return form.handleSubmit(onSubmit)(event);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>State</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isExistingStep && (
              <FormField
                control={form.control}
                name="existingUtility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Existing Utility</FormLabel>
                    <FormControl>
                      <AllUtilitiesCombobox
                        state={state}
                        utilityId={field.value.id}
                        onUtilityChange={field.onChange}
                        ref={field.ref}
                        modal
                      />
                    </FormControl>
                    <FormMessage />
                    {stepButton}
                  </FormItem>
                )}
              />
            )}
            {!isExistingStep && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    {stepButton}
                  </FormItem>
                )}
              />
            )}
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
