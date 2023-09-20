import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Header from "@/components/Header";
import RoutingGuard from "@/components/RoutingGuard";
import api from "@/api";

async function getProfile() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  return api.users
    .usersControllerGetUserInfo({
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    .then(({ data }) => data);
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (profile == null) {
    notFound();
  }

  return (
    <RoutingGuard authenticated={true}>
      <Header initialProfile={profile} />
      <main className="container px-6">{children}</main>
    </RoutingGuard>
  );
}
