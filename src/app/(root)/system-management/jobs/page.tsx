import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import { initialPagination } from "./constants";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

interface SearchParams {
  pageIndex: string | undefined;
  pageSize: string | undefined;
}

async function getJobs(searchParams: SearchParams) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.jobs
    .findJobPaginatedHttpControllerFindJob(
      {
        page: searchParams.pageIndex
          ? Number(searchParams.pageIndex) + 1
          : initialPagination.pageIndex + 1,
        limit: searchParams.pageSize
          ? Number(searchParams.pageSize)
          : initialPagination.pageSize,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )
    .then(({ data }) => data)
    .catch((error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        notFound();
      }

      return null;
    });
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const jobs = await getJobs(searchParams);

  return <Client initialJobs={jobs} />;
}
