import RoutingGuard from "@/components/RoutingGuard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoutingGuard authenticated={false}>
      <main className="w-96 mx-auto flex flex-col justify-center">
        <h1 className="h1 mb-12 mt-40 text-center">Barun Corp</h1>
        {children}
      </main>
    </RoutingGuard>
  );
}
