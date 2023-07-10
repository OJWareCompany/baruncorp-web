"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
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
import usePositionsQuery from "@/queries/usePositionsQuery";
import usePostUserPositionMutation from "@/queries/usePostUserPositionMutation";
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
import useDeleteUserPositionMutation from "@/queries/useDeleteUserPositionMutation";
import { useProfileQueryWithParams } from "@/queries/useProfileQuery";

export default function PositionField() {
  const { data: profile } = useProfileQueryWithParams();
  const { data: positions } = usePositionsQuery();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { mutate: postUserPositionMutate } = usePostUserPositionMutation(
    profile?.id
  );
  const { mutate: deleteUserPositionMutate } = useDeleteUserPositionMutation(
    profile?.id
  );

  return (
    <div className="space-y-2">
      <Label>Position</Label>
      <div className="flex gap-2 flex-wrap">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                  {positions?.map((position) => (
                    <CommandItem
                      key={position.id}
                      onSelect={() => {
                        postUserPositionMutate(position.id);
                        setPopoverOpen(false);
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
                    deleteUserPositionMutate(profile?.position?.id ?? null);
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
  );
}
