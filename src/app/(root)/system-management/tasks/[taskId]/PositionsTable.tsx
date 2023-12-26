import { useListData } from "react-stately";
import { GridList, GridListItem, useDragAndDrop } from "react-aria-components";
import { AlignJustify, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TaskResponseDto } from "@/api";
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

interface Props {
  task: TaskResponseDto;
}

export default function PositionsTable({ task }: Props) {
  const list = useListData({
    // initialItems: task.taskPositions,
    initialItems: [
      {
        order: 1,
        positionId: "1",
        positionName: "Sr. Designer",
        autoAssignmentType: "Residential / Commercial",
      },
      {
        order: 2,
        positionId: "2",
        positionName: "Jr. Designer",
        autoAssignmentType: "Residential / Commercial",
      },
      {
        order: 3,
        positionId: "3",
        positionName: "Jr. EIT",
        autoAssignmentType: "Residential / Commercial",
      },
    ],
    getKey: ({ positionId }) => positionId,
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useDeletePositionTaskMutation();

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

  return (
    <div className="border rounded-md text-sm">
      <div className="flex items-center border-b transition-colors hover:bg-muted/50 last:border-none font-medium h-12 text-muted-foreground">
        <div className="basis-[68px]"></div>
        <div className="px-4 basis-[81px]">Priority</div>
        <div className="px-4 flex-1">Name</div>
        <div className="px-4 flex-1">Auto Assignment Property Type</div>
        <div className="basis-[68px]"></div>
      </div>
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
                        mutateAsync({
                          positionId: item.positionId,
                          taskId: task.id,
                        }).then(() => {
                          queryClient.invalidateQueries({
                            queryKey: getTaskQueryKey(task.id),
                          });
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
    </div>
  );
}
