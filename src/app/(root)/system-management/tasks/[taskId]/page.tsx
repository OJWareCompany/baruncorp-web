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
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="h4">Prerequisite Tasks</h2>
            <NewPrerequisiteTaskDialog task={task} />
          </div>
          <PrerequisiteTasksTable task={task} />
        </section>
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="h4">Positions</h2>
            <NewPositionDialog task={task} />
          </div>
          <PositionsTable
            task={task}
            key={JSON.stringify(task.taskPositions)}
          />
        </section>
        <section className="space-y-2">
          <h2 className="h4">Workers</h2>
          <WorkersTable task={task} />
        </section>
      </div>
    </div>
  );
}
