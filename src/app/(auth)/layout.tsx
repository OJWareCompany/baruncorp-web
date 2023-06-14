export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="w-96 mx-auto flex flex-col justify-center">
        <h1 className="h1 mb-12 mt-48 text-center">Barun Corp</h1>
        {children}
      </main>
    </>
  );
}
