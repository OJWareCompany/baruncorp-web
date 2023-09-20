import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Client from "./client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getAhjNote(geoId: string) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return;
  }

  return api.geography
    .geographyControllerGetFindNoteByGeoId(geoId, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    .then(({ data }) => data);
}

interface Props {
  params: {
    geoId: string;
  };
}

export default async function Page({ params: { geoId } }: Props) {
  const ahjNote = await getAhjNote(geoId);

  if (ahjNote == null) {
    notFound();
  }

  return <Client geoId={geoId} initialAhjNote={ahjNote} />;
}
