import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getOrganization() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  const profile = await api.users
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
  if (profile == null) {
    return null;
  }

  return api.organizations
    .findOrganizationHttpControllerGet(profile.organizationId, {
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
  const organization = await getOrganization();

  return <Client initialOrganization={organization} />;
}
