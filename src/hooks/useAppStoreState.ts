import { useStore } from "zustand";

import { store } from "../store";
import { StoreState } from "../types";

function useAppStoreState<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  return useStore(store, selector, equalityFn);
}

export { useAppStoreState };
