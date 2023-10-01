import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getServices() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.services
    .findServicePaginatedHttpControllerGet(
      {
        limit: Number.MAX_SAFE_INTEGER,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )
    .then(({ data }) => data.items)
    .catch((error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        notFound();
      }

      return null;
    });
}

export default async function Page() {
  const services = await getServices();

  return <Client initialServices={services} />;
}
