"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePositionsQuery from "@/queries/usePositionsQuery";
import usePostUserPositionMutation from "@/queries/usePostUserPositionMutation";
import useDeleteUserPositionMutation from "@/queries/useDeleteUserPositionMutation";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import usePatchProfileMutation from "@/queries/usePatchProfileMutation";
import useProfileQuery from "@/queries/useProfileQuery";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDeleteUserLicenseMutation from "@/queries/useDeleteUserLicenseMutation";
import LicenseRegistrationDialog from "@/components/LicenseRegistrationDialog";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
  role: z.string(),
});

interface Props {
  params: {
    userId: string;
  };
}

export default function Page(props: Props) {
  const {
    params: { userId },
  } = props;
  const { data: postions } = usePositionsQuery();
  const { data: profile, isSuccess: isProfileQuerySuccess } =
    useProfileQuery(userId);
  const { mutateAsync } = usePatchProfileMutation(userId);
  const { mutate: mutateForPostMemberPosition } =
    usePostUserPositionMutation(userId);
  const { mutate: mutateForDeleteMemberPosition } =
    useDeleteUserPositionMutation(userId);
  const { mutate: mutateForDeleteMemberLicense } =
    useDeleteUserLicenseMutation(userId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = form;

  useEffect(() => {
    if (!isProfileQuerySuccess) {
      return;
    }

    const { email, firstName, lastName, role, organization } = profile;

    reset({
      email,
      firstName,
      lastName,
      organization,
      role: role ?? "-",
    });
  }, [isProfileQuerySuccess, profile, reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName } = values;

    await mutateAsync({
      firstName,
      lastName,
    });
  }

  const [positionPopoverOpen, setPositionPopoverOpen] = useState(false);

  return (
    <div className="space-y-4 max-w-sm">
      <h1 className="h3">User</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            fullWidth
            disabled={!isDirty}
            loading={isSubmitting}
          >
            Save
          </Button>
        </form>
      </Form>
      <div className="space-y-2">
        <Label>Position</Label>
        <div className="flex gap-2 flex-wrap">
          <Popover
            open={positionPopoverOpen}
            onOpenChange={setPositionPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                disabled={profile?.position != null}
                variant={"outline"}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search position..." />
                <CommandEmpty>No position found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {postions?.map((position) => (
                      <CommandItem
                        key={position.id}
                        onSelect={() => {
                          mutateForPostMemberPosition(position.id);
                          setPositionPopoverOpen(false);
                        }}
                      >
                        {position.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {profile?.position && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Badge
                  variant={"secondary"}
                  className="gap-1 cursor-pointer h-8 rounded-md pr-2"
                >
                  {profile.position.name}
                  <X className="h-4 w-4" />
                </Badge>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-xs">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (profile?.position?.id == null) {
                        return;
                      }

                      mutateForDeleteMemberPosition(profile.position.id);
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Licenses</Label>
        <div className="flex gap-2 flex-wrap">
          <LicenseRegistrationDialog />
          {profile?.licenses.map((license) => {
            const { abbreviation, type, priority, issuingCountryName } =
              license;
            const key = `${abbreviation} / ${type} / ${priority}`;
            return (
              <AlertDialog key={key}>
                <AlertDialogTrigger asChild>
                  <Badge
                    variant={"secondary"}
                    className="gap-1 cursor-pointer h-8 rounded-md pr-2 whitespace-nowrap"
                  >
                    {key}
                    <X className="h-4 w-4" />
                  </Badge>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-xs">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        mutateForDeleteMemberLicense({
                          type,
                          issuingCountryName,
                        });
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          })}
        </div>
      </div>
    </div>
  );
}
