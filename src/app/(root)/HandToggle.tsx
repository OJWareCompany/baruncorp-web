"use client";
import { Grab, Hand } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import useHandsStatusQuery, {
  getHandsStatusQueryKey,
} from "@/queries/useHandsStatusQuery";
import usePostUserHandsDownMutation from "@/mutations/usePostUserHandsDownMutation";
import usePostUserHandsUpMutation from "@/mutations/usePostUserHandsUpMutation";
import { useToast } from "@/components/ui/use-toast";

export default function HandToggle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: handStatus } = useHandsStatusQuery();
  const { mutateAsync: postUserHandsDownMutateAsync } =
    usePostUserHandsDownMutation();
  const { mutateAsync: postUserHandsUpMutateAsync } =
    usePostUserHandsUpMutation();

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        if (handStatus == null) {
          return;
        }

        if (handStatus.status) {
          postUserHandsDownMutateAsync().then(() => {
            toast({
              title: "Success",
            });
            queryClient.invalidateQueries({
              queryKey: getHandsStatusQueryKey(),
            });
          });
        } else {
          postUserHandsUpMutateAsync().then(() => {
            toast({
              title: "Success",
            });
            queryClient.invalidateQueries({
              queryKey: getHandsStatusQueryKey(),
            });
          });
        }
      }}
    >
      {handStatus?.status ? (
        <Hand className="h-4 w-4 text-green-600" />
      ) : (
        <Grab className="h-4 w-4" />
      )}
    </Button>
  );
}
