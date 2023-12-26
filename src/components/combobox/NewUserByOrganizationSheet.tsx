"use client";

import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import NewUserForm from "../form/NewUserForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getUsersQueryKey } from "@/queries/useUsersQuery";

interface Props extends DialogProps {
  organizationId: string;
  onUserIdChange: (newUserId: string) => void;
}

export default function NewUserByOrganizationSheet({
  organizationId,
  onUserIdChange,
  ...dialogProps
}: Props) {
  const queryClient = useQueryClient();

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New User</SheetTitle>
        </SheetHeader>
        <NewUserForm
          onSuccess={(userId) => {
            dialogProps.onOpenChange?.(false);
            onUserIdChange(userId);
            queryClient.invalidateQueries({
              queryKey: getUsersQueryKey({ organizationId }),
            });
          }}
          organizationId={organizationId}
        />
      </SheetContent>
    </Sheet>
  );
}
