"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketContext } from "../SocketProvider";
import { useEffect } from "react";
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
