import { ClientOnly } from "../ClientOnly";
import Authenticate from "./Authenticate";
import SocketProvider from "./SocketProvider";
import ExpandProvider from "./ExpandProvider";
import MainWrapper from "./MainWrapper";
import Header from "./Header";
import ProfileProvider from "./ProfileProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticate>
      <SocketProvider>
        <ClientOnly>
          <ExpandProvider>
            <ProfileProvider>
              <Header />
              <MainWrapper>{children}</MainWrapper>
            </ProfileProvider>
          </ExpandProvider>
        </ClientOnly>
      </SocketProvider>
    </Authenticate>
  );
}
