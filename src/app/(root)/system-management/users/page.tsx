import UsersTable from "./UsersTable";
import NewUserSheet from "./NewUserSheet";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/users", name: "Users" }]}
        action={<NewUserSheet />}
      />
      <UsersTable />
    </div>
  );
}
