import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { initialPagination } from "./components/constants";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getAhjNotes() {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  const { pageIndex, pageSize } = initialPagination;

  return api.geography
    .geographyControllerGetFindNotes(
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
  const ahjNotes = await getAhjNotes();

  if (ahjNotes == null) {
    notFound();
  }

  return <Client initialAhjNotes={ahjNotes} />;
}
