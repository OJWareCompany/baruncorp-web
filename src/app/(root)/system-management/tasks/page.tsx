"use client";
import { useProfileContext } from "../../ProfileProvider";
import NewTaskSheet from "./NewTaskSheet";
import TasksTable from "./TasksTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const {
    authority: { canEditTask },
  } = useProfileContext();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/tasks", name: "Tasks" }]}
        action={canEditTask && <NewTaskSheet />}
      />
      <TasksTable />
    </div>
  );
}
