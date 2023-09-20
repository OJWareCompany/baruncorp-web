import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

export default async function Page() {
  const profile = await getProfile();

  if (profile == null) {
    notFound();
  }

  return <Client initialProfile={profile} />;
}
