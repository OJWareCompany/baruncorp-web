import { useSession } from "next-auth/react";
import AssigneeAction from "./AssigneeAction";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
import { JobStatusEnum } from "@/lib/constants";

interface Props {
  assignedTaskId: string;
  userId: string;
  status: JobStatusEnum;
  jobId: string;
  projectId: string;
  pageType: PageType;
}

export default function AssigneeField({
  assignedTaskId,
  userId,
  status,
  jobId,
  projectId,
  pageType,
}: Props) {
  const dispatch = useAlertDialogDataDispatch();
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  return (
    <div className="flex gap-1.5 -ml-[9px]">
      <AssigneeCombobox
        assignedTaskId={assignedTaskId}
        userId={userId}
        onUserIdChange={(newUserId) => {
          dispatch({
            type: "ASSIGN",
            assignedTaskId,
            jobId,
            projectId,
            userId: newUserId,
          });
        }}
        disabled={
          status === "Completed" ||
          status === "Canceled" ||
          status === "On Hold" ||
          !isBarunCorpMember
        }
      />
      {isWorker &&
        userId !== "" &&
        status !== "Completed" &&
        status !== "Canceled" &&
        status !== "On Hold" && (
          <AssigneeAction
            assignedTaskId={assignedTaskId}
            jobId={jobId}
            projectId={projectId}
            userId={userId}
          />
        )}
    </div>
  );
}
