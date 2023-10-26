import type { EventCallback } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import { DependencyList, useEffect } from "react";

const EMPTY_LIST: DependencyList = [];

export function useTauriEventListener<T = unknown>(
  event: string,
  handler: EventCallback<T>,
  deps?: DependencyList,
) {
  useEffect(
    () => {
      let disposed = false;
      const unlistenFnPromise = listen<T>(event, (...args) => {
        if (!disposed) {
          handler(...args);
        }
      });

      return () => {
        disposed = true;
        unlistenFnPromise.then((unlisten) => unlisten());
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...(deps ?? EMPTY_LIST)],
  );
}
