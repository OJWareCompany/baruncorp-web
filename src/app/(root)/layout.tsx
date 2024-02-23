import Authenticate from "./Authenticate";
import SocketProvider from "./SocketProvider";
import ExpandProvider from "./ExpandProvider";
import MainWrapper from "./MainWrapper";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticate>
      <SocketProvider>
        <ExpandProvider>
          <Header />
          <MainWrapper>{children}</MainWrapper>
        </ExpandProvider>
      </SocketProvider>
    </Authenticate>
  );
}
