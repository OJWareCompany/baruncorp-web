"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import PageLoading from "@/components/PageLoading";
import useDepartmentQuery from "@/queries/useDepartmentQuery";
import useProfileQuery from "@/queries/useProfileQuery";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfileQuery();
  const { data: department } = useDepartmentQuery(profile?.departmentId ?? "");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // 아직 profile 받아오는 중
    if (profile == null) {
      return;
    }

    // profile 받아왔는데, department 없는 경우
    if (profile.departmentId == null) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
      return;
    }

    // profile 받아왔고, department 있는데, 아직 department 받아오는 중
    if (department == null) {
      return;
    }

    // department 받아왔는데, 권한 없는 경우
    if (!department.viewClientInvoice) {
      router.push("/");
      toast({
        title: "Invalid access",
        variant: "destructive",
      });
      return;
    }
  }, [department, profile, router, toast]);

  if (
    profile == null ||
    profile.departmentId == null ||
    department == null ||
    !department.viewClientInvoice
  ) {
    return <PageLoading />;
  }

  return children;
}
