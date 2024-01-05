import JobsTable from "./JobsTable";
import PageHeader from "@/components/PageHeader";
import SocketListener from "./SocketListener";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <SocketListener />
      <PageHeader items={[{ href: "/workspace", name: "Workspace" }]} />
      <section>
        <h4 className="h4 mb-2">All</h4>
        <JobsTable type="All" />
      </section>
      <section>
        <h4 className="h4 mb-2">In Progress</h4>
        <JobsTable type="In Progress" />
      </section>
      <section>
        <h4 className="h4 mb-2">Completed</h4>
        <JobsTable type="Completed" />
      </section>
      <section>
        <h4 className="h4 mb-2">On Hold</h4>
        <JobsTable type="On Hold" />
      </section>
      <section>
        <h4 className="h4 mb-2">Canceled</h4>
        <JobsTable type="Canceled" />
      </section>
    </div>
  );
}
