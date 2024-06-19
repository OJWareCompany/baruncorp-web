import { Table } from "@tanstack/react-table";
import { Check, ChevronDown } from "lucide-react"; // Check 아이콘 추가
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import DownloadCSVButton from "./DownloadCSVButton";

interface PaginationControlsProps {
  table: Table<any>;
  data: any;
  type: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  table,
  data,
  type,
}) => {
  return (
    <div className="flex items-center gap-2">
      {table.getRowModel().rows.length === 0 ? null : (
        <DownloadCSVButton data={data} type={type} className="mr-2" />
      )}
      <p className="text-sm font-medium">Rows per page</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-8 " variant={"outline"}>
            {table.getState().pagination.pageSize}
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-[120px] p-1">
          {[5, 10, 25, 50, 100].map((pageSize) => (
            <div
              key={pageSize}
              className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-200 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full`}
              onClick={() => table.setPageSize(pageSize)}
            >
              <input
                type="radio"
                name="pageSize"
                checked={table.getState().pagination.pageSize === pageSize}
                onChange={() => table.setPageSize(pageSize)}
                className="hidden"
              />
              <span className="flex items-center justify-center w-4 h-4 mr-2">
                {table.getState().pagination.pageSize === pageSize && (
                  <Check className="h-4 w-4" />
                )}
              </span>
              {pageSize}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PaginationControls;
