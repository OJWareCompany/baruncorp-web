import AssigneeAction from "./AssigneeAction";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
import { AssignedTaskStatusEnum } from "@/lib/constants";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

interface Props {
  assignedTaskId: string;
  userId: string;
  status: AssignedTaskStatusEnum;
  jobId: string;
  projectId: string;
  pageType: JobDetailPageType;
  openReasonDialog: (assignedTaskId: string) => void;
}

export default function AssigneeField({
  assignedTaskId,
  userId,
  status,
  jobId,
  projectId,
  pageType,
  openReasonDialog,
}: Props) {
  const dispatch = useAlertDialogDataDispatch();

  const { isBarunCorpMember } = useProfileContext();
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
            type: "ASSIGN_TASK",
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
      {isWorker && (
        <AssigneeAction
          assignedTaskId={assignedTaskId}
          jobId={jobId}
          projectId={projectId}
          userId={userId}
          status={status}
          openReasonDialog={openReasonDialog}
        />
      )}
    </div>
  );
}
