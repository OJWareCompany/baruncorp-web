"use client";
import { Grab, Hand } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { useSocketContext } from "./SocketProvider";
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
  const socket = useSocketContext();
  // const isInitialRef = useRef(true);

  useEffect(() => {
    if (socket == null) {
      return;
    }

    const listener = () => {
      queryClient.invalidateQueries({
        queryKey: getHandsStatusQueryKey(),
      });
    };

    socket.on("task-assigned", listener);

    return () => {
      socket.off("task-assigned", listener);
    };
  }, [queryClient, socket]);

  // useEffect(() => {
  //   if (handStatus == null) {
  //     return;
  //   }

  //   if (isInitialRef.current) {
  //     isInitialRef.current = false;
  //     return;
  //   }

  //   if (handStatus.status) {
  //     toast({
  //       title: "Hands up",
  //     });
  //   }
  // }, [handStatus, toast]);

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        if (handStatus == null) {
          return;
        }

        if (handStatus.status) {
          postUserHandsDownMutateAsync()
            .then(() => {
              toast({
                title: "Hands down",
              });
              queryClient.invalidateQueries({
                queryKey: getHandsStatusQueryKey(),
              });
            })
            .catch((error: AxiosError<ErrorResponseData>) => {
              if (
                error.response &&
                error.response.data.errorCode.filter((value) => value != null)
                  .length !== 0
              ) {
                toast({
                  title: error.response.data.message,
                  variant: "destructive",
                });
                return;
              }
            });
        } else {
          postUserHandsUpMutateAsync()
            .then(() => {
              toast({
                title: "Hands Up",
              });
              queryClient.invalidateQueries({
                queryKey: getHandsStatusQueryKey(),
              });
            })
            .catch((error: AxiosError<ErrorResponseData>) => {
              switch (error.response?.status) {
                case 404:
                  if (error.response?.data.errorCode.includes("20305")) {
                    toast({
                      title: "There are no available tasks set",
                      variant: "destructive",
                    });
                    return;
                  }
              }

              if (
                error.response &&
                error.response.data.errorCode.filter((value) => value != null)
                  .length !== 0
              ) {
                toast({
                  title: error.response.data.message,
                  variant: "destructive",
                });
                return;
              }
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
