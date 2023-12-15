import PageHeader from "@/components/PageHeader";

export default function Page() {
  //   const [pagination, setPagination] = usePagination(
  //     initialPagination.pageIndex,
  //     initialPagination.pageSize
  //   );

  //   const { data: jobs, isLoading: isJobsQueryLoading } =
  //     usePaginatedMyActiveJobsQuery({
  //       pagination,
  //     });

  //   if (isJobsQueryLoading || jobs == null) {
  //     return <PageLoading />;
  //   }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/workspace", name: "Workspace" }]} />
      {/* <section>
        <h4 className="h4 mb-2">My Active Jobs</h4>
        <JobsTable
          data={jobs}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </section> */}
    </div>
  );
}
