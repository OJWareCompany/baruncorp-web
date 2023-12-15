"use client";
import ProfileForm from "./ProfileForm";
import useProfileQuery from "@/queries/useProfileQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";

export default function Page() {
  const { data: profile, isLoading: isProfileQueryLoading } = useProfileQuery();

  if (isProfileQueryLoading || profile == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/my/profile", name: "My Profile" }]} />
      <ProfileForm profile={profile} />
    </div>
  );
}
