import Header from "@/components/Header";
import RoutingGuard from "@/components/RoutingGuard";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoutingGuard authenticated={true}>
      <Header />
      <main className="container px-6">{children}</main>
    </RoutingGuard>
  );
}
