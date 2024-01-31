import { useListData } from "react-stately";
import { GridList, GridListItem, useDragAndDrop } from "react-aria-components";
import { AlignJustify, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDeletePositionTaskMutation from "@/mutations/useDeletePositionTaskMutation";
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import usePatchTaskPositionOrderMutation from "@/mutations/usePatchTaskPositionOrderMutation";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  task: TaskResponseDto;
}

export default function PositionsTable({ task }: Props) {
  const session = useSession();
  const list = useListData({
    initialItems: task.taskPositions.sort((a, b) => a.order - b.order),
    getKey: ({ positionId }) => positionId,
  });
  const isInitialRef = useRef(true);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync: deletePositionTaskMutateAsync } =
    useDeletePositionTaskMutation();
  const { mutateAsync: patchTaskPositionOrderMutateAsync } =
    usePatchTaskPositionOrderMutation(task.id);

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
    <div className="border rounded-md text-sm">
      <div className="flex items-center border-b transition-colors hover:bg-muted/50 last:border-none font-medium h-12 text-muted-foreground">
        <div className="basis-[68px]"></div>
        <div className="px-4 basis-[81px]">Priority</div>
        <div className="px-4 flex-1">Name</div>
        <div className="px-4 flex-1">Auto Assignment Property Type</div>
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
              <div className="p-4">
                <Button size={"icon"} className="h-9 w-9" variant={"ghost"}>
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-4 basis-[81px] text-muted-foreground">
                {item.order}.
              </div>
              <div className="p-4 flex-1">{item.positionName}</div>
              <div className="p-4 flex-1">
                <Select
                  value={item.autoAssignmentType}
                  // onValueChange={field.onChange}
                >
                  <SelectTrigger>
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
              <div className="p-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deletePositionTaskMutateAsync({
                            positionId: item.positionId,
                            taskId: task.id,
                          })
                            .then(() => {
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
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </GridListItem>
          )}
        </GridList>
      )}
    </div>
  );
}
