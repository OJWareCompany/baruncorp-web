import { useQueryClient } from "@tanstack/react-query";
import { Ban, Mail, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { AxiosError } from "axios";
import { UserResponseDto } from "@/api/api-spec";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePatchUserDeactivateMutation from "@/mutations/usePatchUserDeactivateMutation";
import usePatchUserReactivateMutation from "@/mutations/usePatchUserReactivateMutation";
import LoadingButton from "@/components/LoadingButton";

interface Props {
  user: UserResponseDto;
}

export default function StatusSectionHeaderAction({ user }: Props) {
  const [state, setState] = useState<
    | { alertDialogOpen: false }
    | {
        alertDialogOpen: true;
        type: "Reactivate" | "Inactivate" | "Send Invitation";
      }
  >({ alertDialogOpen: false });
  const { status, email, organizationId } = user;
  const {
    mutateAsync: postInvitationsMutateAsync,
    isPending: isPostInvitationsMutationPending,
  } = usePostInvitationsMutation();
  const {
    mutateAsync: patchUserDeactivateMutateAsync,
    isPending: isPatchUserDeactivateMutationPending,
  } = usePatchUserDeactivateMutation(user.id);
  const {
    mutateAsync: patchUserReactivateMutateAsync,
    isPending: isPatchUserReactivateMutationPending,
  } = usePatchUserReactivateMutation(user.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isPending =
    isPostInvitationsMutationPending ||
    isPatchUserDeactivateMutationPending ||
    isPatchUserReactivateMutationPending;

  return (
    <div className="flex gap-2">
      {status !== "Inactive" && (
        <Button
          size={"sm"}
          variant={"outline"}
          className="h-[28px] text-xs px-2 text-destructive hover:text-destructive"
          onClick={() => {
            setState({ alertDialogOpen: true, type: "Inactivate" });
          }}
        >
          <Ban className="mr-2 h-4 w-4" />
          Inactivate
        </Button>
      )}
      {status === "Inactive" && (
        <Button
          size={"sm"}
          variant={"outline"}
          className="h-[28px] text-xs px-2"
          onClick={() => {
            setState({ alertDialogOpen: true, type: "Reactivate" });
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reactivate
        </Button>
      )}
      {(status === "Invitation Not Sent" || status === "Invitation Sent") && (
        <Button
          size={"sm"}
          variant={"outline"}
          className="h-[28px] text-xs px-2"
          onClick={() => {
            setState({ alertDialogOpen: true, type: "Send Invitation" });
          }}
        >
          <Mail className="mr-2 h-4 w-4" />
          {status === "Invitation Sent"
            ? "Resend Invitation Email"
            : "Send Invitation Email"}
        </Button>
      )}
      <AlertDialog
        open={state.alertDialogOpen}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setState({ alertDialogOpen: false });
            return;
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
              isLoading={isPending}
              onClick={() => {
                if (!state.alertDialogOpen) {
                  return;
                }

                if (state.type === "Reactivate") {
                  patchUserReactivateMutateAsync()
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getUserQueryKey(user.id),
                      });
                      toast({ title: "Success" });
                      setState({ alertDialogOpen: false });
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
                  return;
                }

                if (state.type === "Inactivate") {
                  patchUserDeactivateMutateAsync()
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getUserQueryKey(user.id),
                      });
                      toast({ title: "Success" });
                      setState({ alertDialogOpen: false });
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
                  return;
                }

                if (state.type === "Send Invitation") {
                  postInvitationsMutateAsync({
                    email,
                    organizationId,
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getUserQueryKey(user.id),
                      });
                      toast({ title: "Success" });
                      setState({ alertDialogOpen: false });
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
                  return;
                }
              }}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
