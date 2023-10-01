import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Authenticate from "./Authenticate";
import Header from "@/components/Header";
import api from "@/api";

async function getProfile() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.users
    .usersControllerGetUserInfo({
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    .then(({ data }) => data)
    .catch(() => null);
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <Authenticate>
      <Header initialProfile={profile} />
      <main className="container px-6 pb-12">{children}</main>
    </Authenticate>
  );
}
