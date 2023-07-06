"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useProfileQuery from "@/queries/useProfileQuery";
import usePatchProfileMutation from "@/queries/usePatchProfileMutation";
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
import usePositionsQuery from "@/queries/usePositionsQuery";
import useServicesQuery from "@/queries/useServicesQuery";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LicenseRegistrationDialog from "@/components/LicenseRegistrationDialog";
import usePostUserPositionMutation from "@/queries/usePostUserPositionMutation";
import usePostUserServiceMutation from "@/queries/usePostUserServiceMutation";
import useDeleteUserPositionMutation from "@/queries/useDeleteUserPositionMutation";
import useDeleteUserServiceMutation from "@/queries/useDeleteUserServiceMutation";
import useDeleteUserLicenseMutation from "@/queries/useDeleteUserLicenseMutation";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First Name is required" }),
  lastName: z.string().trim().min(1, { message: "Last Name is required" }),
  email: z.string().email(),
  organization: z.string(),
  role: z.string(),
});

export default function ProfilePage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      organization: "",
    },
  });
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;
  const { data: postions } = usePositionsQuery();
  const { data: services } = useServicesQuery();

  const { data: profile, isSuccess: isProfileQuerySuccess } = useProfileQuery();
  const { mutateAsync } = usePatchProfileMutation(profile?.id);
  const { mutate: mutateForPostUserPosition } = usePostUserPositionMutation(
    profile?.id
  );
  const { mutate: mutateForPostUserService } = usePostUserServiceMutation(
    profile?.id
  );
  const { mutate: mutateForDeleteUserPosition } = useDeleteUserPositionMutation(
    profile?.id
  );
  const { mutate: mutateForDeleteUserService } = useDeleteUserServiceMutation(
    profile?.id
  );
  const { mutate: mutateForDeleteUserLicense } = useDeleteUserLicenseMutation(
    profile?.id
  );

  useEffect(() => {
    if (!isProfileQuerySuccess) {
      return;
    }

    const { email, firstName, lastName, organization, role } = profile;
    reset({
      firstName,
      lastName,
      email,
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
      <h1 className="h3">Profile</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
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
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search for position" />
                <CommandEmpty>No position found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {postions?.map((position) => (
                      <CommandItem
                        key={position.id}
                        onSelect={() => {
                          mutateForPostUserPosition(position.id);
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
                  <X className="h-4 w-4 text-muted-foreground" />
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

                      mutateForDeleteUserPosition(profile.position.id);
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
        <Label>Services</Label>
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search for service" />
                <CommandEmpty>No service found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {services?.map((service) => {
                      const selected =
                        profile?.services.find(
                          (profileService) => profileService.id === service.id
                        ) != null;

                      return (
                        <CommandItem
                          key={service.id}
                          onSelect={() => {
                            if (selected) {
                              return;
                            }

                            mutateForPostUserService(service.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {service.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {profile?.services.map((service) => (
            <AlertDialog key={service.name}>
              <AlertDialogTrigger asChild>
                <Badge
                  variant={"secondary"}
                  className="gap-1 cursor-pointer h-8 rounded-md pr-2 whitespace-nowrap"
                >
                  {service.name}
                  <X className="h-4 w-4 text-muted-foreground" />
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
                      mutateForDeleteUserService(service.id);
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Licenses</Label>
        <div className="flex gap-2 flex-wrap">
          <LicenseRegistrationDialog userId={profile?.id} />
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
                    <X className="h-4 w-4 text-muted-foreground" />
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
                        mutateForDeleteUserLicense({
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
