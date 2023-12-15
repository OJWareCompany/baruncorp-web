import Authenticate from "./Authenticate";
import Header from "./Header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticate>
      <Header />
      <main className="container px-6 pb-12">{children}</main>
    </Authenticate>
  );
}
