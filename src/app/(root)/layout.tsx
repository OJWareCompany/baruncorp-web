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
      <main className="container py-8">{children}</main>
    </RoutingGuard>
  );
}
