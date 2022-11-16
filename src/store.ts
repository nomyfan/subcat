import { createStore } from "rxtore";
import { createContext, useContext, useRef } from "react";
import type { Store } from "./types";

function create() {
  return createStore<Store>({ items: [] });
}

function useStoreCreation() {
  const ref = useRef<{ value: ReturnType<typeof create> }>();
  if (!ref.current) {
    ref.current = { value: create() };
  }

  return ref.current!.value;
}

const AppContext = createContext<ReturnType<typeof create>>(create());

const useAppStore: ReturnType<typeof create>["useStore"] = (...args) =>
  useContext(AppContext).useStore(...args);

export { useStoreCreation, AppContext, useAppStore };
