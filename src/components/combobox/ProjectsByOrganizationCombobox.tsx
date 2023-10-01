"use client";
import { forwardRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { PopoverProps } from "@radix-ui/react-popover";
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
import useAllProjectsByOrganizationIdQuery from "@/queries/useAllProjectsByOrganizationIdQuery";

interface Props {
  organizationId: string;
  projectId: string;
  onSelect: (newProjectId: string) => void;
  modal?: PopoverProps["modal"];
}

const ProjectsByOrganizationCombobox = forwardRef<HTMLButtonElement, Props>(
  ({ organizationId, projectId, onSelect, modal = false }, ref) => {
    /**
     * State
     */
    const [popoverOpen, setPopoverOpen] = useState(false);

    /**
     * Query
     */
    const { data: projects, isLoading: isProjectsQueryLoading } =
      useAllProjectsByOrganizationIdQuery(organizationId);

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3 font-normal gap-2"
            ref={ref}
            disabled={isProjectsQueryLoading}
          >
            <span className="flex-1 text-start">
              {projectId === ""
                ? "Select an project"
                : projects?.items.find((item) => item.projectId === projectId)
                    ?.propertyFullAddress}
            </span>
            {isProjectsQueryLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[440px]" align="start">
          <Command>
            <CommandInput placeholder="Search" />
            {projects && projects.items.length !== 0 && (
              <CommandEmpty>No project found.</CommandEmpty>
            )}
            {projects &&
              (projects.items.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  No project found.
                </div>
              ) : (
                <CommandList>
                  <CommandGroup>
                    {projects.items.map((project) => {
                      const [street1, ...rest] =
                        project.propertyFullAddress.split(",");

                      return (
                        <CommandItem
                          key={project.projectId}
                          value={project.propertyFullAddress}
                          onSelect={() => {
                            onSelect(project.projectId);
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              projectId === project.projectId
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div>
                            <p className="font-medium">{street1}</p>
                            <p className="text-xs text-muted-foreground">
                              {rest.join(",")}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              ))}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
ProjectsByOrganizationCombobox.displayName = "ProjectsByOrganizationCombobox";

export default ProjectsByOrganizationCombobox;
