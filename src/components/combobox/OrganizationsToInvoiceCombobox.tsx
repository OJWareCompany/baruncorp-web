"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import useOrganizationsToInvoiceQuery from "@/queries/useOrganizationsToInvoiceQuery";

interface Props {
  organizationId: string;
  onOrganizationIdChange: (newOrganizationId: string) => void;
}

const OrganizationsToInvoiceCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, onOrganizationIdChange }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const { data: organizations, isLoading: isOrganizationsQueryLoading } =
      useOrganizationsToInvoiceQuery();

    const placeholderText = "Select an organization";

    if (isOrganizationsQueryLoading || organizations == null) {
      return (
        <Button
          variant="outline"
          className="px-3 font-normal gap-2"
          ref={ref}
          disabled
        >
          <span className="flex-1 text-start">{placeholderText}</span>
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
        </Button>
      );
    }

    const isSelected = organizationId !== "";
    const isEmpty = organizations.clientToInvoices.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : organizations.clientToInvoices.find(
                    (value) => value.id === organizationId
                  )?.name ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">
                No organization to issue client invoice.
              </div>
            ) : (
              <>
                <CommandEmpty>No organization found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {organizations.clientToInvoices.map((organization) => (
                      <CommandItem
                        key={organization.id}
                        value={organization.name}
                        onSelect={() => {
                          onOrganizationIdChange(organization.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            organizationId === organization.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {organization.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
OrganizationsToInvoiceCombobox.displayName = "OrganizationsToInvoiceCombobox";

export default OrganizationsToInvoiceCombobox;
