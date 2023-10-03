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
  onSelect: (newOrganizationId: string) => void;
}

const InvoiceOrganizationsCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, onSelect }, ref) => {
    /**
     * State
     */
    const [popoverOpen, setPopoverOpen] = useState(false);

    /**
     * Query
     */
    const { data: organizations, isLoading: isOrganizationsQueryLoading } =
      useOrganizationsToInvoiceQuery();

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
            disabled={isOrganizationsQueryLoading}
          >
            <span className="flex-1 text-start">
              {organizationId === ""
                ? "Select an organization"
                : organizations?.clientToInvoices.find(
                    (value) => value.id === organizationId
                  )?.name}
            </span>
            {isOrganizationsQueryLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {organizations && organizations.clientToInvoices.length !== 0 && (
              <CommandEmpty>No organization found.</CommandEmpty>
            )}
            {organizations &&
              (organizations.clientToInvoices.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  No organization found.
                </div>
              ) : (
                <CommandList>
                  <CommandGroup>
                    {organizations.clientToInvoices.map((organization) => (
                      <CommandItem
                        key={organization.id}
                        value={organization.name}
                        onSelect={() => {
                          onSelect(organization.id);
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
              ))}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
InvoiceOrganizationsCombobox.displayName = "InvoiceOrganizationsCombobox";

export default InvoiceOrganizationsCombobox;
