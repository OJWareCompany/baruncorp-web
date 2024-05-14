import { create } from "zustand";

type CommonState = {
  triggeredNetworkError: boolean;
  setTriggeredNetworkError: (value: boolean) => void;
};

export const useCommonStore = create<CommonState>((set) => ({
  triggeredNetworkError: false,
  setTriggeredNetworkError: (value: boolean) =>
    set((state) => ({
      ...state,
      triggeredNetworkError: value,
    })),
}));
