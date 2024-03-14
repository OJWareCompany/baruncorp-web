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
      inReview: isBarunCorpMember || isContractor,
      priority: isBarunCorpMember || isContractor,
    };
  }

  if (type === "Completed") {
    return {
      sendDeliverables: isBarunCorpMember ? true : false,
      inReview: isBarunCorpMember || isContractor,
      priority: isBarunCorpMember || isContractor,
    };
  }

  if (type === "Canceled (Invoice)" || type === "All") {
    return {
      sendDeliverables: isBarunCorpMember ? true : false,
      inReview: isBarunCorpMember || isContractor,
      priority: isBarunCorpMember || isContractor,
    };
  }

  return {
    sendDeliverables: false,
    inReview: isBarunCorpMember || isContractor,
    priority: isBarunCorpMember || isContractor,
  };
}
