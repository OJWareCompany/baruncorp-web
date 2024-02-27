import { useListData } from "react-stately";
import { GridList, GridListItem, useDragAndDrop } from "react-aria-components";
import { AlignJustify, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { TaskResponseDto } from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoAssignmentPropertyTypeEnum } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useDeletePositionTaskMutation from "@/mutations/useDeletePositionTaskMutation";
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import usePatchTaskPositionOrderMutation from "@/mutations/usePatchTaskPositionOrderMutation";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";
import usePatchPositionTaskMutation from "@/mutations/usePatchPositionTaskMutation";

interface InternalTableProps {
  task: TaskResponseDto;
  deletePosition: (positionId: string) => void;
}

function InternalTable({ task, deletePosition }: InternalTableProps) {
  const session = useSession();
  const list = useListData({
    initialItems: task.taskPositions.sort((a, b) => a.order - b.order),
    getKey: ({ positionId }) => positionId,
  });
  const isInitialRef = useRef(true);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync: patchTaskPositionOrderMutateAsync } =
    usePatchTaskPositionOrderMutation(task.id);
  const { mutateAsync: patchPositionTaskMutateAsync } =
    usePatchPositionTaskMutation();

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      Array.from(keys).map((key) => ({
        "text/plain": list.getItem(key).positionName,
      })),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys);
      }
    },
  });

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }

    patchTaskPositionOrderMutateAsync({
      taskPositions: list.items.map((value, index) => ({
        ...value,
        order: index + 1,
      })),
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getTaskQueryKey(task.id),
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
  }, [
    list.items,
    patchTaskPositionOrderMutateAsync,
    queryClient,
    session.status,
    task.id,
    toast,
  ]);

  return (
    <div className="border rounded-md text-xs">
      <div className="flex items-center border-b transition-colors hover:bg-muted/50 last:border-none font-medium h-9 text-muted-foreground">
        <div className="basis-[68px]"></div>
        <div className="px-3 basis-[81px]">Priority</div>
        <div className="px-3 flex-1">Name</div>
        <div className="px-3 flex-1">Auto Assignment Property Type</div>
        <div className="basis-[68px]"></div>
      </div>
      {list.items.length === 0 ? (
        <div className="h-24 flex items-center justify-center transition-colors hover:bg-muted/50">
          No results.
        </div>
      ) : (
        <GridList
          dragAndDropHooks={dragAndDropHooks}
          items={list.items}
          className="[&>div.react-aria-DropIndicator]:outline [&>div.react-aria-DropIndicator]:outline-1 [&>div.react-aria-DropIndicator]:outline-primary"
        >
          {(item) => (
            <GridListItem
              id={item.positionId}
              className={
                "flex items-center border-b transition-colors hover:bg-muted/50 last:border-none outline-none"
              }
            >
              <div className="px-3 py-2">
                <Button size={"icon"} className="h-8 w-8" variant={"ghost"}>
                  <AlignJustify className="h-3 w-3" />
                </Button>
              </div>
              <div className="px-3 basis-[81px] text-muted-foreground">
                {item.order}.
              </div>
              <div className="px-3 py-2 flex-1">{item.positionName}</div>
              <div className="px-3 py-2 flex-1">
                <Select
                  value={item.autoAssignmentType}
                  onValueChange={(newValue) => {
                    patchPositionTaskMutateAsync({
                      positionId: item.positionId,
                      taskId: task.id,
                      autoAssignmentType:
                        newValue as AutoAssignmentPropertyTypeEnum,
                    })
                      .then(() => {
                        toast({
                          title: "Success",
                        });
                        queryClient.invalidateQueries({
                          queryKey: getTaskQueryKey(task.id),
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
                  <SelectTrigger className="-ml-[9px] text-xs px-2 h-8 py-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select a property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {AutoAssignmentPropertyTypeEnum.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-3 py-2">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-8 w-8"
                  onClick={() => {
                    deletePosition(item.positionId);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </GridListItem>
          )}
        </GridList>
      )}
    </div>
  );
}

interface Props {
  task: TaskResponseDto;
}

export default function PositionsTable({ task }: Props) {
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; positionId: string }
  >({ open: false });

  const {
    mutateAsync: deletePositionTaskMutateAsync,
    isPending: isDeletePositionTaskMutationPending,
  } = useDeletePositionTaskMutation();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <>
      <InternalTable
        task={task}
        deletePosition={(positionId) => {
          setAlertDialogState({
            open: true,
            positionId,
          });
        }}
        key={JSON.stringify(task.taskPositions)} // 재렌더링을 안시켜주면 GridList가 업데이트가 안되어서 작성함
      />
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setAlertDialogState({ open: newOpen });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isDeletePositionTaskMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                deletePositionTaskMutateAsync({
                  positionId: alertDialogState.positionId,
                  taskId: task.id,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getTaskQueryKey(task.id),
                    });
                    setAlertDialogState({ open: false });
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
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
