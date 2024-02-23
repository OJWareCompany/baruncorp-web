"use client";
import { createContext, useContext } from "react";
import { ToggleState, useToggleState } from "react-stately";

const ExpandContext = createContext<ToggleState | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function ExpandProvider({ children }: Props) {
  const toggleState = useToggleState();

  return (
    <ExpandContext.Provider value={toggleState}>
      {children}
    </ExpandContext.Provider>
  );
}

export function useExpandContext() {
  const toggleState = useContext(ExpandContext);
  if (toggleState == null) {
    throw Error("Must be wrapped with expand provider");
  }

  return toggleState;
}
