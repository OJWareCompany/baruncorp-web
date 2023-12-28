"use client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function SocketProvider({ children }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session == null) {
      return;
    }

    const socket = io(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}?token=${session.accessToken}`,
      {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH,
      }
    );

    setSocket(socket);

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext() {
  const socket = useContext(SocketContext);
  return socket;
}
