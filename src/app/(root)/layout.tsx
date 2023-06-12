import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container py-8">{children}</main>
    </>
  );
}
