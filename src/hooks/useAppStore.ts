import { useContext } from "react";
import { AppStoreContext } from "../AppStoreContext";
import { StoreState } from "../types";
import { useAppStoreState } from "./useAppStoreState";

function useAppStore<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  const { storeApi, actions } = useContext(AppStoreContext);
  const state = useAppStoreState(selector, equalityFn);

  return {
    state,
    actions,
    storeApi,
    setStoreState: storeApi.setState,
    getStoreState: storeApi.getState,
  };
}

export { useAppStore };
