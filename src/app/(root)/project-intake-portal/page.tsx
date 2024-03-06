"use client";
import Link from "next/link";
import React from "react";
import { Info } from "lucide-react";
import { Plate, PlateContent } from "@udecode/plate-common";
import { useProfileContext } from "../ProfileProvider";
import EditDialog from "./EditDialog";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { basicEditorPlugins } from "@/lib/plate/plugins";
import useInformationsQuery from "@/queries/useInformationsQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import { getEditorValue } from "@/lib/plate-utils";

export default function Page() {
  const {
    data: informations,
    isLoading: isInformationsQueryLoading,
    error: informationsQueryError,
  } = useInformationsQuery({
    limit: 1,
  });
  useNotFound(informationsQueryError);
  const { isAdmin } = useProfileContext();

  if (isInformationsQueryLoading || informations == null) {
    return <PageLoading />;
  }
  const information = getEditorValue(
    informations.items.length > 0 ? informations.items[0].contents : ""
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/project-intake-portal", name: "Project Intake Portal" },
        ]}
      />
      <div className="relative">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription className="pt-2">
            <Plate
              plugins={basicEditorPlugins}
              readOnly
              value={information}
              key={JSON.stringify(information)} // 어떤 이유에서인지 re-render가 안되서, information 값이 바뀔 때 마다 key 값을 바꿔줘서 re-render 시킴
            >
              <PlateContent />
            </Plate>
          </AlertDescription>
        </Alert>
        {isAdmin && (
          <div className="absolute top-[17px] right-[17px]">
            <EditDialog information={information} />
          </div>
        )}
      </div>
      <Button asChild>
        <Link href={`/project-intake-portal/new-service-order`}>
          New Service Order
        </Link>
      </Button>
    </div>
  );
}
