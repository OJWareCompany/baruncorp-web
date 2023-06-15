"use client";

import { Column, Table } from "@tanstack/react-table";
import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertCamelCaseToTitleCase } from "@/lib/utils";

interface DataTableFilterProps<TData> {
  table: Table<TData>;
}

export function DataTableFilter<TData>({ table }: DataTableFilterProps<TData>) {
  const allColumns = table.getAllColumns().filter((column) => {
    return typeof column.accessorFn !== "undefined" && column.getCanHide();
  });

  const [selectedColumnId, setSelectColumnId] = useState<Column<TData>["id"]>(
    allColumns[0].id
  );

  const isFiltered =
    table.getPreFilteredRowModel().rows.length >
    table.getFilteredRowModel().rows.length;

  const handleSelectValueChange = (value: string) => {
    table.resetColumnFilters();
    setSelectColumnId(value);
  };

  return (
    <div className="flex flex-1 items-center space-x-2">
      <Select value={selectedColumnId} onValueChange={handleSelectValueChange}>
        <SelectTrigger className="w-auto space-x-1 capitalize h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Columns</SelectLabel>
            {allColumns.map((column) => (
              <SelectItem value={column.id} key={column.id}>
                {convertCamelCaseToTitleCase(column.id)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        placeholder={`Filter by ${convertCamelCaseToTitleCase(
          selectedColumnId
        )}`}
        value={
          (table.getColumn(selectedColumnId)?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn(selectedColumnId)?.setFilterValue(event.target.value)
        }
        className="h-8 w-[250px]"
      />
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
