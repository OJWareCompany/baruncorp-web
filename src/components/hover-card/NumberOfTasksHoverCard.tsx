import React, { useState } from "react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import useAssignedTasksSummaryDetailsQuery from "@/queries/useAssignedTasksSummaryDetailsQuery";
import { AssignedTaskStatusEnum } from "@/lib/constants";

interface Props {
  count: number;
  status?: AssignedTaskStatusEnum;
  userId: string;
}

export default function NumberOfTasksHoverCard({
  count,
  status,
  userId,
}: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useAssignedTasksSummaryDetailsQuery({
    params: { userId, status },
    enabled: open,
  });

  return (
    <HoverCard
      openDelay={0}
      closeDelay={100}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCardTrigger className="underline cursor-pointer">
        {count}
      </HoverCardTrigger>
      <HoverCardContent
        className="w-[auto] max-h-[300px] overflow-y-auto cursor-default p-0"
        side="top"
      >
        {/* {<Loader2 className="w-4 h-4 animate-spin" />} */}
        {data?.items.map((value) => (
          <Link
            key={value.jobId}
            href={`/system-management/jobs/${value.jobId}`}
            className="flex gap-2 border-b last:border-none p-2"
          >
            <div className="w-[400px]">
              <p className="text-xs text-muted-foreground">Job</p>
              <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {value.jobName}
              </p>
            </div>
            <div className="w-[150px]">
              <p className="text-xs text-muted-foreground">Task</p>
              <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {value.taskName}
              </p>
            </div>
          </Link>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
