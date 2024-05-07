"use client";

/**
 * @TODO
 * build 시에 에러(Error: useLocalStorage is a client-only hook)가 발생하여 일단 해당 코드 사용하여 해결
 * 추후 근본적인 원인 파악 및 해결
 * @see https://github.com/uidotdev/usehooks/issues/254
 * @see https://github.com/uidotdev/usehooks/issues/218#issuecomment-1835624086
 */

/**
 * Hack to work around next.js hydration
 * @see https://github.com/uidotdev/usehooks/issues/218
 */
import React from "react";
import { useIsClient } from "@uidotdev/usehooks";

type ClientOnlyProps = {
  children: React.ReactNode;
};

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const isClient = useIsClient();

  // Render children if on client side, otherwise return null
  return isClient ? <>{children}</> : null;
};
