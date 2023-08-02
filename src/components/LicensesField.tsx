"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";
import LicenseRegistrationDialog from "./LicenseRegistrationDialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useUsersControllerDeleteLicenseMutation from "@/queries/useUsersControllerDeleteLicenseMutation";
import useUsersControllerGetUserInfoByUserIdQuery from "@/queries/useUsersControllerGetUserInfoByUserIdQuery";

interface Props {
  userId: string;
}

export default function LicensesField({ userId }: Props) {
  const { data: profile } = useUsersControllerGetUserInfoByUserIdQuery(userId);

  const { mutate: deleteUserLicenseMutate } =
    useUsersControllerDeleteLicenseMutation(userId);

  return (
    <div className="space-y-2">
      <Label>Licenses</Label>
      <div className="flex gap-2 flex-wrap">
        <LicenseRegistrationDialog userId={userId} />
        {profile?.licenses.map((license) => {
          const { abbreviation, type, priority, issuingCountryName } = license;
          const key = `${abbreviation} / ${type} / ${priority}`;
          return (
            <AlertDialog key={key}>
              <AlertDialogTrigger asChild>
                <Badge
                  variant={"secondary"}
                  className="gap-1 cursor-pointer h-8 rounded-md pr-2 whitespace-nowrap"
                >
                  {key}
                  <X className="h-4 w-4 text-muted-foreground" />
                </Badge>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-xs">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteUserLicenseMutate({
                        type,
                        issuingCountryName,
                      });
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })}
      </div>
    </div>
  );
}
