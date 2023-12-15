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
import useProjectsQuery from "@/queries/useProjectsQuery";

interface Props {
  organizationName: string;
  projectId: string;
  onProjectIdChange: (newProjectId: string) => void;
}

const ExistingProjectCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationName, projectId, onProjectIdChange }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const { data: projects, isLoading: isProjectsQueryLoading } =
      useProjectsQuery({ organizationName, limit: Number.MAX_SAFE_INTEGER });

    const placeholderText = "Select an existing project";

    if (isProjectsQueryLoading || projects == null) {
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

    const isSelected = projectId !== "";
    const isEmpty = projects.items.length === 0;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
            disabled={isProjectsQueryLoading}
          >
            <span className="flex-1 text-start">
              {!isSelected
                ? placeholderText
                : projects.items.find((item) => item.projectId === projectId)
                    ?.propertyFullAddress ?? placeholderText}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {isEmpty ? (
              <div className="py-6 text-center text-sm">No project found.</div>
            ) : (
              <>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {projects.items.map((project) => {
                      let value = `${project.propertyFullAddress} ${project.propertyType}`;
                      if (project.propertyOwnerName != null) {
                        value += ` ${project.propertyOwnerName}`;
                      }

                      if (project.projectNumber != null) {
                        value += ` ${project.projectNumber}`;
                      }

                      return (
                        <CommandItem
                          key={project.projectId}
                          value={value}
                          onSelect={() => {
                            onProjectIdChange(project.projectId);
                            setPopoverOpen(false);
                          }}
                          className="gap-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              projectId === project.projectId
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="w-[400px]">
                            <p className="text-xs text-muted-foreground">
                              Property Address
                            </p>
                            <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                              {project.propertyFullAddress}
                            </p>
                          </div>
                          <div className="w-[100px]">
                            <p className="text-xs text-muted-foreground">
                              Property Type
                            </p>
                            <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                              {project.propertyType}
                            </p>
                          </div>
                          <div className="w-[100px]">
                            <p className="text-xs text-muted-foreground">
                              Property Owner
                            </p>
                            <p
                              className={cn(
                                "font-medium whitespace-nowrap overflow-hidden text-ellipsis",
                                project.propertyOwnerName == null &&
                                  "text-muted-foreground font-normal"
                              )}
                            >
                              {project.propertyOwnerName ?? "-"}
                            </p>
                          </div>
                          <div className="w-[100px]">
                            <p className="text-xs text-muted-foreground">
                              Project Number
                            </p>
                            <p
                              className={cn(
                                "font-medium whitespace-nowrap overflow-hidden text-ellipsis",
                                project.projectNumber == null &&
                                  "text-muted-foreground font-normal"
                              )}
                            >
                              {project.projectNumber ?? "-"}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })}
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
ExistingProjectCombobox.displayName = "ExistingProjectCombobox";

export default ExistingProjectCombobox;
