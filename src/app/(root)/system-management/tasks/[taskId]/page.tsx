"use client";
import TaskForm from "./TaskForm";
import NewPrerequisiteTaskDialog from "./NewPrerequisiteTaskDialog";
import PositionsTable from "./PositionsTable";
import NewPositionDialog from "./NewPositionDialog";
import PrerequisiteTasksTable from "./PrerequisiteTasksTable";
import WorkersTable from "./WorkersTable";
import PageHeader from "@/components/PageHeader";
import useTaskQuery from "@/queries/useTaskQuery";
import PageLoading from "@/components/PageLoading";
import useServiceQuery from "@/queries/useServiceQuery";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

interface Props {
  params: {
    taskId: string;
  };
}

export default function Page({ params: { taskId } }: Props) {
  const {
    data: task,
    isLoading: isTaskQueryLoading,
    error: taskQueryError,
  } = useTaskQuery(taskId);
  const {
    data: service,
    isLoading: isServiceQueryLoading,
    error: serviceQueryError,
  } = useServiceQuery(task?.serviceId ?? "");
  useNotFound(taskQueryError);
  useNotFound(serviceQueryError);
  const {
    authority: { canEditTask },
  } = useProfileContext();

  if (
    isTaskQueryLoading ||
    task == null ||
    isServiceQueryLoading ||
    service == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/tasks", name: "Tasks" },
          {
            href: `/system-management/tasks/${taskId}}`,
            name: task.name,
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <TaskForm task={task} service={service} />
        </section>
        <CollapsibleSection
          title="Prerequisite Tasks"
          action={canEditTask && <NewPrerequisiteTaskDialog task={task} />}
        >
          <PrerequisiteTasksTable task={task} />
        </CollapsibleSection>
        <CollapsibleSection
          title="Positions"
          action={canEditTask && <NewPositionDialog task={task} />}
        >
          <PositionsTable task={task} />
        </CollapsibleSection>
        <CollapsibleSection title="Workers">
          <WorkersTable task={task} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
