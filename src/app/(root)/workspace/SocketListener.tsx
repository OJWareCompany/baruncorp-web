"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocketContext } from "../SocketProvider";
import { getMyJobsQueryKey } from "@/queries/useMyJobsQuery";

export default function SocketListener() {
  const socket = useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket == null) {
      return;
    }

    const listener = () => {
      queryClient.invalidateQueries({
        queryKey: getMyJobsQueryKey({}),
      });
    };

    socket.on("task-assigned", listener);

    return () => {
      socket.off("task-assigned", listener);
    };
  }, [queryClient, socket]);

  return null;
}
