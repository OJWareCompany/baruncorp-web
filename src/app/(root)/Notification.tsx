"use client";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSocketContext } from "./SocketProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useNotificationsQuery, {
  getNotificationsQueryKey,
} from "@/queries/useNotificationsQuery";
import { formatInEST } from "@/lib/utils";
import usePatchNotificationCheckMutation from "@/mutations/usePatchNotificationCheckMutation";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";

export default function Notification() {
  const { toast } = useToast();
  const socket = useSocketContext();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications } = useNotificationsQuery({
    limit: Number.MAX_SAFE_INTEGER,
  });
  const router = useRouter();
  const usePatchNotificationCheckMutationResult =
    usePatchNotificationCheckMutation();

  useEffect(() => {
    if (socket == null) {
      return;
    }

    const listener = () => {
      setOpen(true);
      queryClient.invalidateQueries({
        queryKey: getNotificationsQueryKey({
          limit: Number.MAX_SAFE_INTEGER,
        }),
      });
    };

    socket.on("task-assigned", listener);

    return () => {
      socket.off("task-assigned", listener);
    };
  }, [queryClient, socket, toast]);

  if (notifications == null) {
    return (
      <Button variant="ghost" size={"icon"}>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  const items = notifications.items
    .filter((value) => !value.isCheckedOut)
    .sort((a, b) => {
      if (new Date(a.createdAt) > new Date(b.createdAt)) {
        return -1;
      } else {
        return 1;
      }
    });

  const isEmpty = items.length === 0;

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] data-[state=closed]:fade-out-100 data-[state=closed]:zoom-out-100 data-[state=open]:fade-in-100 data-[state=open]:zoom-in-100 p-0"
        align="end"
        side="top"
      >
        {isEmpty ? (
          <div className="h-[68px] flex justify-center items-center text-sm">
            No notification.
          </div>
        ) : (
          <div className="h-full max-h-[400px] overflow-y-auto">
            {items.map((value) => (
              <div
                key={value.id}
                className="p-3 flex gap-2 items-center border-b last:border-none cursor-pointer"
                onClick={() => {
                  router.push(`/workspace/jobs/${value.jobId}`);
                  setOpen(false);
                }}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {value.taskName} task has been assigned
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatInEST(value.createdAt)}
                  </span>
                </div>
                <LoadingButton
                  isLoading={usePatchNotificationCheckMutationResult.isPending}
                  variant="ghost"
                  size={"icon"}
                  onClick={(event) => {
                    event.stopPropagation();

                    usePatchNotificationCheckMutationResult
                      .mutateAsync({ assigningTaskAlertId: value.id })
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: getNotificationsQueryKey({
                            limit: Number.MAX_SAFE_INTEGER,
                          }),
                        });
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
                >
                  {!usePatchNotificationCheckMutationResult.isPending && (
                    <X className="h-4 w-4" />
                  )}
                </LoadingButton>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
