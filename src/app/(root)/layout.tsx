import Authenticate from "./Authenticate";
import Header from "./Header";
import SocketProvider from "./SocketProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticate>
      <SocketProvider>
        <Header />
        <main className="container px-6 pb-12">{children}</main>
      </SocketProvider>
    </Authenticate>
  );
}
