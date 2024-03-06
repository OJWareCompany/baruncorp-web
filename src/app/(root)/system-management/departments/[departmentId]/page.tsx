"use client";
import DepartmentForm from "./DepartmentForm";
import PageHeaderAction from "./PageHeaderAction";
import UsersTable from "./UsersTable";
import NewUserDialog from "./NewUserDialog";
import PageHeader from "@/components/PageHeader";
import useDepartmentQuery from "@/queries/useDepartmentQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import CollapsibleSection from "@/components/CollapsibleSection";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

interface Props {
  params: {
    departmentId: string;
  };
}

export default function Page({ params: { departmentId } }: Props) {
  const {
    data: department,
    isLoading: isDepartmentQueryLoading,
    error: departmentQueryError,
  } = useDepartmentQuery(departmentId);
  useNotFound(departmentQueryError);
  const { isAdmin } = useProfileContext();

  if (isDepartmentQueryLoading || department == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/departments", name: "Departments" },
          {
            href: `/system-management/departments/${departmentId}}`,
            name: department.name,
          },
        ]}
        action={isAdmin && <PageHeaderAction departmentId={departmentId} />}
      />
      <div className="space-y-6">
        <section>
          <DepartmentForm department={department} />
        </section>
        <CollapsibleSection
          title="Users"
          action={isAdmin && <NewUserDialog department={department} />}
        >
          <UsersTable department={department} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
