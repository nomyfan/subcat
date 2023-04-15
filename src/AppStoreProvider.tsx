import type { StoreApi } from "zustand";
import { useMemo, useRef } from "react";
import type { StoreState } from "./types";
import { createStoreState, createStoreActions } from "./store";
import { AppStoreContext } from "./AppStoreContext";

function AppStoreProvider(props: React.PropsWithChildren<unknown>) {
  const storeApi = useRef<StoreApi<StoreState>>();
  if (!storeApi.current) {
    storeApi.current = createStoreState();
  }

  const value = useMemo(() => {
    return {
      storeApi: storeApi.current!,
      actions: createStoreActions(storeApi.current!),
    };
  }, []);

  return (
    <AppStoreContext.Provider value={value}>
      {props.children}
    </AppStoreContext.Provider>
  );
}

export { AppStoreProvider };
