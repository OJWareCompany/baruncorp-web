"use client";
import { forwardRef, useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import LoadingButton from "../LoadingButton";
import { toast } from "../ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useOrganizationsQuery from "@/queries/useOrganizationsQuery";
import usePostJoinOrganizationMutation from "@/mutations/usePostJoinOrganizationMutation";

interface Props {
  organizationId: string;
  onOrganizationIdChange: (newOrganizationId: string) => void;
  disabled?: boolean;
  modal?: boolean;
  dateOfJoining?: Date;
  userId: string;
}

const OrganizationChangeCombobox = forwardRef<HTMLButtonElement, Props>(
  (
    {
      organizationId,
      onOrganizationIdChange,
      disabled = false,
      modal = false,
      dateOfJoining,
      userId,
    },
    ref
  ) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [alertDialogState, setAlertDialogState] = useState<
      { open: false } | { open: true; selectedOrganizationId: string }
    >({ open: false });

    const { data: organizations, isLoading: isOrganizationsQueryLoading } =
      useOrganizationsQuery({
        limit: Number.MAX_SAFE_INTEGER,
      });

    const {
      mutateAsync: PostJoinOrganizationAsync,
      isPending: isPostJoinOrganizationMutationPending,
    } = usePostJoinOrganizationMutation(userId, organizationId);

    useEffect(() => {
      return () => {
        PostJoinOrganizationAsync({
          dateOfJoining: dateOfJoining?.toISOString().slice(0, 7),
        });
        console.log("## USE EFFECT ##");
      };
    }, [organizationId]); // 변경된 organizationId가 받아오면서 변경될 때마다 실행

    const placeholderText = "Select an organization";
    if (isOrganizationsQueryLoading || organizations == null) {
      return (
        <Button
          variant="outline"
          className="w-full px-3 font-normal gap-2"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
        </Button>
      );
    }

    const isSelected = organizationId !== "";
    const isEmpty = organizations.items.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full px-3 font-normal gap-2"
            ref={ref}
            disabled={disabled}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : organizations.items.find(
                    (value) => value.id === organizationId
                  )?.name ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">
                No organization found.
              </div>
            ) : (
              <>
                <CommandEmpty>No organization found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {organizations.items.map((organization) => (
                      <CommandItem
                        key={organization.id}
                        value={organization.name}
                        onSelect={() => {
                          setAlertDialogState({
                            open: true,
                            selectedOrganizationId: organization.id,
                          });
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            organizationId === organization.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {organization.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
        <AlertDialog
          open={alertDialogState.open}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setAlertDialogState({ open: false });
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <LoadingButton
                isLoading={isPostJoinOrganizationMutationPending}
                onClick={async () => {
                  if (!alertDialogState.open) {
                    return;
                  }
                  try {
                    onOrganizationIdChange(
                      alertDialogState.selectedOrganizationId // state로 변경된 값이 바로 적용 안됨. 이전 값이 들어감. // userForm에 변경된 organizationId를 보내는 작업
                    );
                    setAlertDialogState({ open: false });
                    toast({ title: "Success" });
                  } catch (error: any) {
                    const axiosError = error as AxiosError<ErrorResponseData>;
                    if (
                      axiosError.response &&
                      axiosError.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: axiosError.response.data.message,
                        variant: "destructive",
                      });
                    }
                  }
                }}
              >
                Continue
              </LoadingButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Popover>
    );
  }
);
OrganizationChangeCombobox.displayName = "OrganizationChangeCombobox";

export default OrganizationChangeCombobox;
