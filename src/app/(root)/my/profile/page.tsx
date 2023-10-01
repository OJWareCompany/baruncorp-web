import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    .catch((error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        notFound();
      }

      return null;
    });
}

export default async function Page() {
  const profile = await getProfile();

  return <Client initialProfile={profile} />;
}
