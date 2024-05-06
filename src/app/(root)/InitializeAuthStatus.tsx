"use client";

import { useSession } from "next-auth/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * useSession.status 값을 가져와서 useAuthStore.authStatus 값을 초기화
 * 사용자가 웹 앱에 접속한 시점에 한 번만 호출되야 함
 * 이후 호출되면 안됨
 */
const InitializeAuthStatus = React.memo(function InitializeAuthStatus() {
  const { status } = useSession();
  const { setAuthStatus } = useAuthStore();
  const isInitializedAuthStatus = useRef(false);

  useEffect(() => {
    if (isInitializedAuthStatus.current) return;
    if (status === "loading") return;
    console.info(`[InitailizeAuthStatus Component] authStatus: ${status}`);
    setAuthStatus(status);
    isInitializedAuthStatus.current = true;
  }, [status, setAuthStatus]);

  return <></>;
});

export default InitializeAuthStatus;
