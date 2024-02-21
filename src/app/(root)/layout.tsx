"use client";
import { useToggleState } from "react-stately";
import Authenticate from "./Authenticate";
import Header from "./Header";
import SocketProvider from "./SocketProvider";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const toggleState = useToggleState();

  return (
    <Authenticate>
      <SocketProvider>
        <Header toggleState={toggleState} />
        <main
          className={cn(
            "container px-6 pb-12",
            toggleState.isSelected && "max-w-[1920px]"
          )}
        >
          {children}
        </main>
      </SocketProvider>
    </Authenticate>
  );
}
