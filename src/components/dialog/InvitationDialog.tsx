import React from "react";
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import LoadingButton from "../LoadingButton";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";

interface Props {
  dialogState:
    | { open: false }
    | { open: true; email: string; organizationId: string };
  closeDialog: () => void;
  onInviteSuccess: () => void;
}

export default function InvitationDialog({
  dialogState,
  closeDialog,
  onInviteSuccess,
}: Props) {
  const {
    mutateAsync: postInvitationsMutateAsync,
    isLoading: isPostInvitationMutationLoading,
  } = usePostInvitationsMutation();
  const { toast } = useToast();

  return (
    <Dialog
      open={dialogState.open}
      onOpenChange={(newOpen) => {
        if (newOpen) {
          return;
        }

        closeDialog();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Would you like to invite this person to sign in?
          </DialogTitle>
          <DialogDescription>
            Only those who have been invited and signed up can sign in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              closeDialog();
            }}
          >
            Not Now
          </Button>
          <LoadingButton
            onClick={() => {
              if (!dialogState.open) {
                return;
              }

              postInvitationsMutateAsync({
                email: dialogState.email,
                organizationId: dialogState.organizationId,
              })
                .then(() => {
                  toast({
                    title: "Success",
                  });
                  onInviteSuccess();
                  closeDialog();
                })
                .catch((error: AxiosError<ErrorResponseData>) => {
                  if (
                    error.response &&
                    error.response.data.errorCode.filter(
                      (value) => value != null
                    ).length !== 0
                  ) {
                    toast({
                      title: error.response.data.message,
                      variant: "destructive",
                    });
                    return;
                  }
                });
            }}
            isLoading={isPostInvitationMutationLoading}
          >
            Yes, Send Invitation Email
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
