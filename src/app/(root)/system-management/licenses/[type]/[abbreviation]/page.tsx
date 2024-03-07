"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LicenseForm from "./LicenseForm";
import LicensedWorkersTable from "./LicensedWorkersTable";
import NewLicensedWorkerDialog from "./NewLicensedWorkerDialog";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { LicenseTypeEnum } from "@/lib/constants";
import useLicenseQuery from "@/queries/useLicenseQuery";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

interface Props {
  params: {
    type: LicenseTypeEnum;
    abbreviation: string;
  };
}

export default function Page({ params: { type, abbreviation } }: Props) {
  const router = useRouter();
  const {
    authority: { canEditLicense },
  } = useProfileContext();

  const isInvalid = useMemo(
    () =>
      type !== LicenseTypeEnum.Values.Structural &&
      type !== LicenseTypeEnum.Values.Electrical,
    [type]
  );

  const {
    data: license,
    isLoading: isLicenseQueryLoading,
    error: licenseQueryError,
  } = useLicenseQuery({ type, abbreviation });

  useNotFound(licenseQueryError);

  useEffect(() => {
    if (isInvalid) {
      router.replace(`/system-management/licenses`, {
        scroll: false,
      });
    }
  }, [isInvalid, router]);

  if (isInvalid || isLicenseQueryLoading || license == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/licenses", name: "Licenses" },
          {
            href: `/system-management/licenses?type=${type}`,
            name: type,
          },
          {
            href: `/system-management/licenses/${type}/${abbreviation}`,
            name: license.state,
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <LicenseForm license={license} />
        </section>

        <CollapsibleSection
          title="Licensed Workers"
          action={
            canEditLicense && (
              <NewLicensedWorkerDialog
                type={type}
                abbreviation={abbreviation}
                license={license}
              />
            )
          }
        >
          <LicensedWorkersTable license={license} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
