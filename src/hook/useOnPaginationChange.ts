import { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageIndexSearchParamName: string;
  pageSizeSearchParamName: string;
  pagination: PaginationState;
}

export default function useOnPaginationChange({
  pageIndexSearchParamName,
  pageSizeSearchParamName,
  pagination,
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
      newSearchParams.set(
        encodeURIComponent(pageSizeSearchParamName),
        String(pageSize)
      );
      router.push(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  };
}
