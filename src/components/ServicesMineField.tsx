"use client";

import React from "react";
import { Check, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
import { Label } from "@/components/ui/label";
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
import useServicesQuery from "@/queries/useDepartmentControllerFindAllServicesQuery";
import useDepartmentControllerPutMemberInChageOfTheServiceMutation from "@/queries/useDepartmentControllerPutMemberInChageOfTheServiceMutation";
import useDepartmentControllerTerminateServiceMemberIsInChargeOfMutation from "@/queries/useDepartmentControllerTerminateServiceMemberIsInChargeOfMutation";
import { cn } from "@/lib/utils";
import useUsersControllerGetUserInfoQuery from "@/queries/useUsersControllerGetUserInfoQuery";

export default function ServicesMineField() {
  const { data: profile } = useUsersControllerGetUserInfoQuery();
  const { data: services } = useServicesQuery();
  const { mutate: postUserServiceMutate } =
    useDepartmentControllerPutMemberInChageOfTheServiceMutation(profile?.id);
  const { mutate: deleteUserServiceMutate } =
    useDepartmentControllerTerminateServiceMemberIsInChargeOfMutation(
      profile?.id
    );

  return (
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

                          postUserServiceMutate(service.id);
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
                    deleteUserServiceMutate(service.id);
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
  );
}
