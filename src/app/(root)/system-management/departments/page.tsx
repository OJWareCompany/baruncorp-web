"use client";
import { useProfileContext } from "../../ProfileProvider";
import NewDepartmentSheet from "./NewDepartmentSheet";
import DepartmentsTable from "./DepartmentsTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { isAdmin } = useProfileContext();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/departments", name: "Departments" },
        ]}
        action={isAdmin && <NewDepartmentSheet />}
      />
      <DepartmentsTable />
    </div>
  );
}
