import { VisibilityState } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import useProfileQuery from "@/queries/useProfileQuery";

export default function useJobsColumnVisibility(): VisibilityState {
  const { data: session } = useSession();
  const { data: user } = useProfileQuery();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isContractor = user?.isVendor ?? false;

  return {
    inReview: isBarunCorpMember || isContractor,
    priority: isBarunCorpMember || isContractor,
  };
}
