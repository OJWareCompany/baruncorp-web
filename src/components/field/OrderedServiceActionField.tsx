import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderedServiceStatusEnum } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import usePatchOrderedServiceCancelMutation from "@/mutations/usePatchOrderedServiceCancelMutation";
// import usePatchOrderedServiceReactivateMutation from "@/mutations/usePatchOrderedServiceReactivateMutation";

interface Props {
  orderedServiceId: string;
  status: OrderedServiceStatusEnum;
  jobId: string;
  projectId: string;
  disabled?: boolean;
}

export default function OrderedServiceActionField({
  orderedServiceId,
  status,
  jobId,
  projectId,
  disabled = false,
}: Props) {
  const [state, setState] = useState<
    | { alertDialogOpen: false }
    | { alertDialogOpen: true; type: "Cancel" | "Reactivate" }
  >({ alertDialogOpen: false });
  const queryClient = useQueryClient();
  // const { mutateAsync: patchOrderedServiceCancelMutateAsync } =
  //   usePatchOrderedServiceCancelMutation(orderedServiceId);
  // const { mutateAsync: patchOrderedServiceReactivateMutateAsync } =
  //   usePatchOrderedServiceReactivateMutation(orderedServiceId);

  if (disabled) {
    return;
  }

  // TODO
  // const isPending = status === OrderedServiceStatusEnum.Values.Pending;
  const isCanceled = status === OrderedServiceStatusEnum.Values.Canceled;

  if (isCanceled) {
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
              {/* TODO */}
              <DropdownMenuItem
                onClick={() => {
                  setState({ alertDialogOpen: true, type: "Cancel" });
                }}
                className="text-destructive focus:text-destructive"
              >
                Cancel
              </DropdownMenuItem>
              {/* {isPending && (
              )} */}
              {isCanceled && (
                <DropdownMenuItem
                  onClick={() => {
                    setState({ alertDialogOpen: true, type: "Reactivate" });
                  }}
                >
                  Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

                    if (state.type === "Cancel") {
                      // TODO
                      // patchOrderedServiceCancelMutateAsync()
                      //   .then(() => {
                      //     queryClient.invalidateQueries({
                      //       queryKey: getJobQueryKey(jobId),
                      //     });
                      //     queryClient.invalidateQueries({
                      //       queryKey: getProjectQueryKey(projectId),
                      //     });
                      //   })
                      //   .catch(() => {
                      //     // TODO: error handling
                      //   });
                      // return;
                    }

                    if (state.type === "Reactivate") {
                      // TODO
                      // patchOrderedServiceReactivateMutateAsync()
                      //   .then(() => {
                      //     queryClient.invalidateQueries({
                      //       queryKey: getJobQueryKey(jobId),
                      //     });
                      //     queryClient.invalidateQueries({
                      //       queryKey: getProjectQueryKey(projectId),
                      //     });
                      //   })
                      //   .catch(() => {
                      //     // TODO: error handling
                      //   });
                      // return;
                    }
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
}
