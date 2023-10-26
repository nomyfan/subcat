import { createStore as createStore_ } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import shallow from "zustand/shallow";

import type { StoreState } from "./types";

function createStore() {
  return createStore_(
    subscribeWithSelector(
      immer<StoreState>(() => {
        return { items: [] };
      }),
    ),
  );
}

const store = createStore();

export { shallow, createStore, store };
