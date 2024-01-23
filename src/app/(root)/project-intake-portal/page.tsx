"use client";
import Link from "next/link";
import React from "react";
import { Info } from "lucide-react";
import { Plate, PlateContent } from "@udecode/plate-common";
import EditDialog from "./EditDialog";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { basicEditorPlugins } from "@/lib/plate/plugins";
import useInformationsQuery from "@/queries/useInformationsQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";

export default function Page() {
  const {
    data: informations,
    isLoading: isInformationsQueryLoading,
    error: informationsQueryError,
  } = useInformationsQuery({
    limit: 1,
  });
  useNotFound(informationsQueryError);

  if (isInformationsQueryLoading || informations == null) {
    return <PageLoading />;
  }
  const information = JSON.parse(informations.items[0].contents);

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
              key={information}
            >
              <PlateContent />
            </Plate>
          </AlertDescription>
        </Alert>
        <div className="absolute top-[17px] right-[17px]">
          <EditDialog information={information} />
        </div>
      </div>
      <Button asChild>
        <Link href={`/project-intake-portal/new-service-order`}>
          New Service Order
        </Link>
      </Button>
    </div>
  );
}
