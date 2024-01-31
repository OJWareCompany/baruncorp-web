import React, { useState } from "react";
import { Mail, MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { UserPaginatedResponseDto } from "@/api/api-spec";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";
import { getUsersQueryKey } from "@/queries/useUsersQuery";

interface Props {
  status: UserPaginatedResponseDto["items"][number]["status"];
  email: string;
  organizationId: string;
}

export default function UserActionField({
  status,
  email,
  organizationId,
}: Props) {
  const { toast } = useToast();
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const { mutateAsync: postInvitationsMutateAsync } =
    usePostInvitationsMutation();
  const queryClient = useQueryClient();

  if (status !== "Invitation Sent" && status !== "Invitation Not Sent") {
    return null;
  }

  return (
    <div className="text-right">
      <div
        className="inline-flex"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setAlertDialogOpen(true);
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              {status === "Invitation Sent"
                ? "Resend Invitation Email"
                : "Send Invitation Email"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog
          open={alertDialogOpen}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setAlertDialogOpen(false);
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
                  postInvitationsMutateAsync({
                    email,
                    organizationId,
                  })
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: getUsersQueryKey({}),
                      });
                      toast({ title: "Success" });
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
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
