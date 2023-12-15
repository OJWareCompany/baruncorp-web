import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AssignedTaskResponseFields } from "@/api";
import { statuses } from "@/lib/constants";

interface Props {
  tasks: AssignedTaskResponseFields[];
}

export default function TasksBadge({ tasks }: Props) {
  if (tasks.length === 0) {
    return <Badge variant={"outline"}>{tasks.length}</Badge>;
  }

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger>
        <Badge variant={"outline"}>{tasks.length}</Badge>
      </HoverCardTrigger>
      <HoverCardContent className="p-0 w-[auto] cursor-default" side="right">
        <div>
          {tasks.map((task) => {
            const status = statuses.find(
              (status) => status.value === task.status
            );

            return (
              <div
                className="flex items-center pl-2 pr-3 py-1.5 border-t first:border-0"
                key={task.assignTaskId}
              >
                {status && (
                  <status.Icon
                    className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                  />
                )}
                <div className="flex flex-col">
                  <p className="font-medium">{task.taskName}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assigneeName ?? "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
