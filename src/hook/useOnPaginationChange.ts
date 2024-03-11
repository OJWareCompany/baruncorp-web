import { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageIndexSearchParamName: string;
  pagination: PaginationState;
  updatePageSize: (newPageSize: number) => void;
}

export default function useOnPaginationChange({
  pageIndexSearchParamName,
  pagination,
  updatePageSize,
}: Props): OnChangeFn<PaginationState> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (updater) => {
    if (typeof updater === "function") {
      const { pageIndex, pageSize } = updater(pagination);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(
        encodeURIComponent(pageIndexSearchParamName),
        String(pageIndex)
      );
      updatePageSize(pageSize);
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  };
}
