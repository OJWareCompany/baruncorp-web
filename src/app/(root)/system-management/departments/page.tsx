"use client";
import { useSession } from "next-auth/react";
import NewDepartmentSheet from "./NewDepartmentSheet";
import DepartmentsTable from "./DepartmentsTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { data: session } = useSession();

  const isAdmin = session?.isAdmin ?? false;

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
