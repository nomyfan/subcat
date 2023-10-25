import { createStore as createStore_ } from "zustand";
import { immer } from "zustand/middleware/immer";
import shallow from "zustand/shallow";
import type { StoreState } from "./types";

function createStore() {
  return createStore_(
    immer<StoreState>(() => {
      return { items: [], dragging: false };
    }),
  );
}

const store = createStore();

export { shallow, createStore, store };
