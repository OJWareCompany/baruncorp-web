import Unauthenticate from "./Unauthenticate";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Unauthenticate>
      <main className="w-96 mx-auto flex flex-col justify-center py-32">
        <h1 className="h1 mb-12 text-center">Barun Corp</h1>
        {children}
      </main>
    </Unauthenticate>
  );
}
