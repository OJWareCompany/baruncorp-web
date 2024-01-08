import { useQueryClient } from "@tanstack/react-query";
import { Ban, Mail, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { UserResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePatchUserDeactivateMutation from "@/mutations/usePatchUserDeactivateMutation";
import usePatchUserReactivateMutation from "@/mutations/usePatchUserReactivateMutation";

interface Props {
  user: UserResponseDto;
}

export default function StatusSectionHeaderAction({ user }: Props) {
  const [state, setState] = useState<
    | { alertDialogOpen: false }
    | { alertDialogOpen: true; type: "Reactivate" | "Inactivate" }
  >({ alertDialogOpen: false });
  const { status, email, organizationId } = user;
  const { mutateAsync: postInvitationsMutateAsync } =
    usePostInvitationsMutation();
  const { mutateAsync: patchUserDeactivateMutateAsync } =
    usePatchUserDeactivateMutation(user.id);
  const { mutateAsync: patchUserReactivateMutateAsync } =
    usePatchUserReactivateMutation(user.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
            postInvitationsMutateAsync({
              email,
              organizationId,
            })
              .then(() => {
                queryClient.invalidateQueries({
                  queryKey: getUserQueryKey(user.id),
                });
                toast({ title: "Success" });
              })
              .catch(() => {
                // TODO: error handling
              });
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
            <AlertDialogAction
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
                    })
                    .catch(() => {
                      // TODO: error handling
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
                    })
                    .catch(() => {
                      // TODO: error handling
                    });
                  return;
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
