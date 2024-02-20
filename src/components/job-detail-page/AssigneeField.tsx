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
  disabled?: boolean;
}

export default function AssigneeField({
  assignedTaskId,
  userId,
  status,
  jobId,
  projectId,
  disabled = false,
}: Props) {
  const dispatch = useAlertDialogDataDispatch();
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;

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
          status === "On Hold" ||
          disabled ||
          !isBarunCorpMember
        }
      />
      {/* TODO: Completed 인 경우 Reset 시키는 액션 */}
      {!disabled &&
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
