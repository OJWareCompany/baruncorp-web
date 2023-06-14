import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session) return redirect("/");
  return (
    <>
      <main className="w-96 mx-auto flex flex-col justify-center">
        <h1 className="h1 mb-12 mt-40 text-center">Barun Corp</h1>
        {children}
      </main>
    </>
  );
}
