import { useContext } from "react";
import { useStore } from "zustand";
import { AppStoreContext } from "../AppStoreContext";
import { StoreState } from "../types";

function useAppStoreState<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  const { storeApi } = useContext(AppStoreContext);
  return useStore(storeApi, selector, equalityFn);
}

export { useAppStoreState };
