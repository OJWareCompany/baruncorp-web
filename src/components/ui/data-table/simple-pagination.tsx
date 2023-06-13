import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface DataTableSimplePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTableSimplePagination<TData>({
  table,
}: DataTableSimplePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
