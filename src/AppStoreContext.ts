import { createContext } from "react";
import type { IStoreActions } from "./store";
import type { StoreApi } from "zustand";
import type { StoreState } from "./types";

// @see https://github.com/vitejs/vite/issues/3301#issuecomment-1080030773
const AppStoreContext = createContext<{
  storeApi: StoreApi<StoreState>;
  actions: IStoreActions;
}>(undefined as any); // Set to `undefined` to debug quickly.

export { AppStoreContext };
