import { VisibilityState } from "@tanstack/react-table";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import { JobStatusEnum } from "@/lib/constants";

export default function useJobsColumnVisibility(
  type?: "All" | JobStatusEnum
): VisibilityState {
  const { isBarunCorpMember, isContractor } = useProfileContext();

  return {
    inReview: isBarunCorpMember || isContractor,
    priority: isBarunCorpMember || isContractor,
    sendDeliverables:
      (isBarunCorpMember && type === "Completed") ||
      type === "Canceled (Invoice)" ||
      type === "All",
  };
}
