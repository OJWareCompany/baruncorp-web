import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
      <span>🚧 Work In Progress 🚧</span>
    </div>
  );
}
