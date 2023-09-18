import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { initialPagination } from "./constants";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getProjects() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  const { pageIndex, pageSize } = initialPagination;

  return api.projects
    .findProjectsHttpControllerFindUsers(
      {
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
  const projects = await getProjects();

  if (projects == null) {
    notFound();
  }

  return <Client initialProjects={projects} />;
}
