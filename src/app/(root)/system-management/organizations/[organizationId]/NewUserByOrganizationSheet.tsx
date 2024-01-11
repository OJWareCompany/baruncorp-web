"use client";

import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { getUsersQueryKey } from "@/queries/useUsersQuery";
import NewUserForm from "@/components/form/NewUserForm";
import InvitationDialog from "@/components/dialog/InvitationDialog";
interface Props {
  organizationId: string;
}

export default function NewUserByOrganizationSheet({ organizationId }: Props) {
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogState, setDialogState] = useState<
    { open: false } | { open: true; email: string; organizationId: string }
  >({ open: false });

  const queryClient = useQueryClient();

  const closeDialog = () => {
    setDialogState({ open: false });
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant={"outline"}
            size={"sm"}
            className="h-[28px] text-xs px-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[1400px] w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>New User</SheetTitle>
          </SheetHeader>
          <NewUserForm
            onSuccess={({ email, organizationId }) => {
              setSheetOpen(false);
              setDialogState({
                open: true,
                organizationId,
                email,
              });
              toast({
                title: "Success",
              });
              queryClient.invalidateQueries({
                queryKey: getUsersQueryKey({ organizationId }),
              });
            }}
            organizationId={organizationId}
          />
        </SheetContent>
      </Sheet>
      <InvitationDialog
        dialogState={dialogState}
        closeDialog={closeDialog}
        onInviteSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: getUsersQueryKey({ organizationId }),
          });
        }}
      />
    </>
  );
}
