"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import useJobQuery from "@/queries/useJobQuery";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

function PageHeader() {
  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/system-management">
            System Management
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/system-management/jobs">
            Jobs
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link}>Job Detail</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">Job Detail</h3>
      </div>
    </div>
  );
}

const formSchema = z.object({
  organization: z.string().trim(),
  user: z.string().trim(),
  emailAddressesToReceiveDeliverables: z.array(z.string()),
  additionalInformation: z.string().trim(),
  mountingType: z.string().trim(),
});

export default function Page() {
  const { jobId } = useParams() as { jobId: string };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      additionalInformation: "",
      emailAddressesToReceiveDeliverables: [],
      organization: "",
      user: "",
      mountingType: "",
    },
  });

  /**
   * Query
   */
  // const { data: job } = useJobQuery(jobId);

  /**
   * useEffect
   */
  // useEffect(() => {
  //   if (job) {
  //     const {
  //       clientInfo: {
  //         clientOrganizationName,
  //         clientUserName,
  //         deliverablesEmails,
  //       },
  //       additionalInformationFromClient,
  //       mountingType,
  //     } = job;

  //     form.reset({
  //       organization: clientOrganizationName ?? "",
  //       user: clientUserName ?? "",
  //       additionalInformation: additionalInformationFromClient ?? "",
  //       emailAddressesToReceiveDeliverables: deliverablesEmails ?? [],
  //       mountingType: mountingType ?? "",
  //     });
  //   }
  // }, [form, job]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("submitted");
  }

  return (
    <>
      <PageHeader />
      <div className="py-4">
        <div className="bg-muted h-[400px] flex items-center justify-center">
          <span className="h3">Job Detail Section</span>
        </div>
        {/* <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section>
              <h4 className="h4 mb-2">Client</h4>
              <ItemsContainer>
                <RowItemsContainer>
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </RowItemsContainer>
                <FormField
                  control={form.control}
                  name="emailAddressesToReceiveDeliverables"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          Email Addresses to Receive Deliverables
                        </FormLabel>
                        {field.value.map((email, index) => (
                          <Input key={index} value={email} readOnly />
                        ))}
                      </FormItem>
                    );
                  }}
                />
              </ItemsContainer>
            </section>
            <FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mountingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mounting Type</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form> */}
      </div>
    </>
  );
}
