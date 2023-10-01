import { getServerSession } from "next-auth";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import Client from "./Client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import api from "@/api";

async function getAhjNote(geoId: string) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return null;
  }

  return api.geography
    .geographyControllerGetFindNoteByGeoId(geoId, {
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
    geoId: string;
  };
}

export default async function Page({ params: { geoId } }: Props) {
  const ahjNote = await getAhjNote(geoId);

  return <Client geoId={geoId} initialAhjNote={ahjNote} />;
}
