import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  return api.projects
    .findProjectDetailHttpControllerFindProjectDetail(projectId, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    .then(({ data }) => data);
}

interface Props {
  params: {
    projectId: string;
  };
}

export default async function Page({ params: { projectId } }: Props) {
  const project = await getProject(projectId);

  if (project == null) {
    notFound();
  }

  return <Client initialProject={project} />;
}
