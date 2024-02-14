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
}

export default function AssigneeField({
  assignedTaskId,
  userId,
  status,
  jobId,
  projectId,
}: Props) {
  const dispatch = useAlertDialogDataDispatch();

  return (
    <div className="flex gap-2 -ml-[13px]">
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
          status === "On Hold"
        }
      />
      {/* TODO: Completed 인 경우 Reset 시키는 액션 */}
      {userId !== "" &&
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
