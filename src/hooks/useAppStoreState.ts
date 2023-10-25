import { useStore } from "zustand";
import { StoreState } from "../types";
import { store } from "../store";

function useAppStoreState<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  return useStore(store, selector, equalityFn);
}

export { useAppStoreState };
