"use client";
import TaskForm from "./TaskForm";
import PageHeader from "@/components/PageHeader";
import useTaskQuery from "@/queries/useTaskQuery";
import PageLoading from "@/components/PageLoading";
import useServiceQuery from "@/queries/useServiceQuery";

interface Props {
  params: {
    taskId: string;
  };
}

export default function Page({ params: { taskId } }: Props) {
  const { data: task, isLoading: isTaskQueryLoading } = useTaskQuery(taskId);
  const { data: service, isLoading: isServiceQueryLoading } = useServiceQuery(
    task?.serviceId ?? ""
  );

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
      <TaskForm task={task} service={service} />
    </div>
  );
}
