import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { initialPagination } from "./constants";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getInitialProjects() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  const { pageIndex, pageSize } = initialPagination;

  return api.projects
    .findProjectsHttpControllerFindUsers(
      {
        organizationId: null,
        projectNumber: null,
        propertyFullAddress: null,
        propertyType: null,
        limit: pageSize,
        page: pageIndex + 1,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )
    .then(({ data }) => data);
}

export default async function Page() {
  const initialProjects = await getInitialProjects();

  if (initialProjects == null) {
    notFound();
  }

  return <Client initialProjects={initialProjects} />;
}
