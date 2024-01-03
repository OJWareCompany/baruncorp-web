import { useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import React from "react";
import { UserResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";

interface Props {
  user: UserResponseDto;
}

export default function StatusSectionHeaderAction({ user }: Props) {
  const { status, email, organizationId } = user;
  const { mutateAsync: postInvitationsMutateAsync } =
    usePostInvitationsMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (status !== "Invitation Sent" && status !== "Invitation Not Sent") {
    return null;
  }

  return (
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
  );
}
