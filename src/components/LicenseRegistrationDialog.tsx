"use client";

import { CalendarIcon, Check, ChevronsUpDown, Plus } from "lucide-react";
import * as z from "zod";
import { useForm, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStatesQuery from "@/queries/useStatesQuery";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePostUserLicenseMutation from "@/queries/usePostUserLicenseMutation";

const formSchema = z.object({
  type: z.enum(["Electrical", "Structural"]), // TODO: constants로 만들어 사용하기
  abbreviation: z.string(),
  issuingCountryName: z.string({ required_error: "State is required" }),
  priority: z.string({ required_error: "Priority is required" }),
  issuedDate: z.date({
    required_error: "Issued Date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry Date is required",
  }),
});

interface Props {
  userId: string | undefined;
}

export default function LicenseRegistrationDialog(props: Props) {
  const { userId } = props;
  const { data: states } = useStatesQuery();
  const [statePopoverOpen, setStatePopoverOpen] = useState(false);
  const { mutateAsync } = usePostUserLicenseMutation(userId);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Electrical",
    },
  });
  const {
    resetField,
    control,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { priority, issuedDate, expiryDate, ...rest } = values;
    await mutateAsync({
      ...rest,
      priority: Number(priority),
      issuedDate: format(issuedDate, "yyyy-MM-dd"),
      expiryDate: format(expiryDate, "yyyy-MM-dd"),
    }).then(() => {
      resetField("issuingCountryName");
      resetField("priority");
      resetField("issuedDate");
      resetField("expiryDate");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register License</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Type</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Structural">Structural</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="issuingCountryName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel required>State</FormLabel>
                  <Popover
                    modal={true}
                    open={statePopoverOpen}
                    onOpenChange={setStatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between font-normal px-3",
                            !field.value && "text-muted-foreground",
                            field.value && "capitalize"
                          )}
                        >
                          {field.value?.toLowerCase() ?? "Select a state"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search for state" />
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {states?.map((state) => (
                              <CommandItem
                                key={state.name}
                                onSelect={() => {
                                  form.setValue(
                                    "issuingCountryName",
                                    state.name,
                                    {
                                      shouldValidate: true,
                                    }
                                  );
                                  form.setValue(
                                    "abbreviation",
                                    state.abbreviation
                                  );
                                  setStatePopoverOpen(false);
                                }}
                                className="capitalize"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === state.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {state.name.toLowerCase()}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Priority</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="issuedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel required>Issued Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "px-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel required>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "px-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" loading={isSubmitting}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
