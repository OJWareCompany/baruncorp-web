import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getOrganization(organizationId: string) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.organizations
    .findOrganizationHttpControllerGet(organizationId, {
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

interface Props {
  params: {
    organizationId: string;
  };
}

export default async function Page({ params: { organizationId } }: Props) {
  const organization = await getOrganization(organizationId);

  return <Client initialOrganization={organization} />;
}
