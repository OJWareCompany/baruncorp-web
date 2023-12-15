import { PaginationState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function usePagination(
  initialPageIndex = 0,
  initialPageSize = 10
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageIndexFromSearchParams = searchParams.get("pageIndex");
  const pageSizeFromSearchParams = searchParams.get("pageSize");

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndexFromSearchParams
      ? Number(pageIndexFromSearchParams)
      : initialPageIndex,
    pageSize: pageSizeFromSearchParams
      ? Number(pageSizeFromSearchParams)
      : initialPageSize,
  });

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("pageIndex", String(pagination.pageIndex));
    urlSearchParams.set("pageSize", String(pagination.pageSize));

    router.replace(`${pathname}?${urlSearchParams.toString()}`, {
      scroll: false,
    });
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    pathname,
    router,
    searchParams,
  ]);

  return [pagination, setPagination] as const;
}
