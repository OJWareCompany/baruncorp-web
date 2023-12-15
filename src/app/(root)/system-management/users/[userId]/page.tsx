"use client";
import UserForm from "./UserForm";
import PageHeader from "@/components/PageHeader";
import useUserQuery from "@/queries/useUserQuery";
import PageLoading from "@/components/PageLoading";

interface Props {
  params: {
    userId: string;
  };
}

export default function Page({ params: { userId } }: Props) {
  const { data: user, isLoading: isUserQueryLoading } = useUserQuery(userId);

  if (isUserQueryLoading || user == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/users", name: "Users" },
          {
            href: `/system-management/users/${userId}}`,
            name: user.fullName,
          },
        ]}
      />
      <UserForm user={user} />
    </div>
  );
}
