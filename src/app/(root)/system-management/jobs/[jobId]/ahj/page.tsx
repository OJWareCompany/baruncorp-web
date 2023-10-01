import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getJob(jobId: string) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.jobs
    .findJobHttpControllerFindJob(jobId, {
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

async function getProject(projectId: string | null) {
  if (projectId == null) {
    return null;
  }

  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.projects
    .findProjectDetailHttpControllerFindProjectDetail(projectId, {
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
    jobId: string;
  };
}

export default async function Page({ params: { jobId } }: Props) {
  const job = await getJob(jobId);
  const project = await getProject(job?.projectId ?? null);

  return <Client initialJob={job} initialProject={project} />;
}
