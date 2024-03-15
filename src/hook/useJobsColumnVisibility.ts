import { VisibilityState } from "@tanstack/react-table";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

export default function useJobsColumnVisibility(): VisibilityState {
  const { isBarunCorpMember, isContractor } = useProfileContext();
  return {
    inReview: isBarunCorpMember || isContractor,
    priority: isBarunCorpMember || isContractor,
  };
}
