"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import JobsTable from "./JobsTable";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import Minimap from "@/components/Minimap";
import useProjectQuery from "@/queries/useProjectQuery";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useProjectsByOrganizationIdQuery from "@/queries/useProjectsByOrganizationIdQuery";
import { cn } from "@/lib/utils";

interface Props extends DialogProps {
  selectedOrganizationId: string;
  onSelect: (newProjectId: string) => void;
}

const formSchema = z.object({
  project: z.object({
    tempId: z
      .string()
      .trim()
      .min(1, { message: "Project Temp Id is required" }),
    id: z.string().trim().min(1, { message: "Project Id is required" }),
    propertyAddress: z
      .string()
      .trim()
      .min(1, { message: "Project Property Address is required" }),
    propertyType: z.enum(["Residential", "Commercial"], {
      required_error: "Project Property Type is required",
    }),
    propertyOwner: z.string(),
    projectNumber: z.string(),
    coordinates: z
      .array(z.number())
      .min(1, { message: "Project Coordinates is required" }),
  }),
});

export default function ExistingProjectSheet({
  selectedOrganizationId,
  onSelect,
  ...dialogProps
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project: {
        tempId: "",
        id: "",
        projectNumber: "",
        propertyAddress: "",
        propertyOwner: "",
        coordinates: [],
      },
    },
  });

  /**
   * State
   */
  const [projectsComboboxOpen, setProjectsComboboxOpen] = useState(false);

  /**
   * Watch
   */
  const watchProject = form.watch("project");
  const watchProjectTempId = form.watch("project.tempId");

  /**
   * Query
   */
  const { data: projects, isLoading: isProjectsQueryLoading } =
    useProjectsByOrganizationIdQuery(selectedOrganizationId);
  const { data: project } = useProjectQuery(watchProjectTempId);

  /**
   * useEffect
   */
  useEffect(() => {
    form.reset();
  }, [form, selectedOrganizationId]);

  useEffect(() => {
    if (project) {
      const {
        projectId,
        projectNumber,
        propertyAddress,
        projectPropertyOwnerName,
        propertyType,
      } = project;
      const { coordinates, fullAddress } = propertyAddress ?? {};

      form.setValue("project", {
        tempId: projectId,
        id: projectId,
        projectNumber: projectNumber ?? "",
        propertyAddress: fullAddress ?? "",
        coordinates: coordinates ?? [],
        propertyOwner: projectPropertyOwnerName ?? "",
        propertyType,
      });
    }
  }, [form, project]);

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Existing Project</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="project.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Property Address</FormLabel>
                  <FormControl>
                    <Popover
                      open={projectsComboboxOpen}
                      onOpenChange={setProjectsComboboxOpen}
                      modal={true}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          aria-expanded={projectsComboboxOpen}
                          className="justify-between px-3 font-normal"
                        >
                          {field.value === ""
                            ? "Select a project"
                            : projects?.find(
                                (project) => project.projectId === field.value
                              )?.propertyFullAddress}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[440px]" align="start">
                        <Command>
                          <CommandInput placeholder="Search" />
                          {isProjectsQueryLoading && (
                            <div className="h-[68px] flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          )}
                          {!isProjectsQueryLoading &&
                          projects &&
                          projects.length === 0 ? (
                            <div className="h-[68px] flex justify-center items-center text-sm">
                              No project found.
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandList>
                                <CommandGroup>
                                  {projects?.map((project) => {
                                    const [street1, ...rest] =
                                      project.propertyFullAddress.split(",");

                                    return (
                                      <CommandItem
                                        key={project.projectId}
                                        value={project.propertyFullAddress}
                                        onSelect={() => {
                                          form.setValue(
                                            "project.tempId",
                                            project.projectId
                                          );
                                          setProjectsComboboxOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 flex-shrink-0",
                                            field.value === project.projectId
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div>
                                          <p className="font-medium">
                                            {street1}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {rest.join(",")}
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
                  </FormControl>
                </FormItem>
              )}
            />
            {watchProject.id !== "" && (
              <>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="project.propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Property Type</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project.propertyOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Owner</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project.projectNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Number</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <div className="w-full h-[400px]">
                  <Minimap
                    longitude={watchProject.coordinates[0]}
                    latitude={watchProject.coordinates[1]}
                  />
                </div>
                <JobsTable jobs={project?.jobs ?? []} />
                <RowItemsContainer>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      dialogProps.onOpenChange?.(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onSelect(watchProject.id);
                      dialogProps.onOpenChange?.(false);
                      form.reset();
                    }}
                  >
                    Select
                  </Button>
                </RowItemsContainer>
              </>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
