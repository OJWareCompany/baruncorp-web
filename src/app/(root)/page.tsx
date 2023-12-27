import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
      <span>🚧 Work In Progress 🚧</span>
      {/* <section>
        <h4 className="h4 mb-2">My Active Jobs</h4>
        <JobsTable />
      </section> */}
    </div>
  );
}
