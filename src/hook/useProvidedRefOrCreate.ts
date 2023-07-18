import React from "react";

// ref. https://github.com/primer/react/blob/main/src/hooks/useProvidedRefOrCreate.ts
export function useProvidedRefOrCreate<TRef>(
  providedRef?: React.RefObject<TRef>
): React.RefObject<TRef> {
  const createdRef = React.useRef<TRef>(null);
  return providedRef ?? createdRef;
}
