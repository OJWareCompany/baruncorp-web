import { VisibilityState } from "@tanstack/react-table";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import { JobStatusEnum } from "@/lib/constants";

export default function useJobsColumnVisibility(
  type?: "All" | JobStatusEnum
): VisibilityState {
  const { isBarunCorpMember, isContractor } = useProfileContext();

  if (!type) {
    return {
      sendDeliverables: true,
    };
  }

  return {
    inReview: isBarunCorpMember || isContractor,
    priority: isBarunCorpMember || isContractor,
    sendDeliverables: isBarunCorpMember
      ? type === "Completed"
        ? true
        : type === "Canceled (Invoice)" || type === "All"
        ? true
        : false
      : false,
  };
}
