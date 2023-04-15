import { StoreApi, createStore } from "zustand";
import shallow from "zustand/shallow";
import { produce } from "immer";
import type { StoreState, Item, Index } from "./types";

function createStoreState(): StoreApi<StoreState> {
  return createStore<StoreState>(() => {
    return { items: [], dragging: false };
  });
}

function createStoreActions(storeApi: StoreApi<StoreState>) {
  const setStoreState = (factory: (state: StoreState) => void) => {
    storeApi.setState(produce(factory));
  };

  const updateItem = (index: number, factory: (item: Item) => Item) => {
    const { items } = storeApi.getState();
    if (index < 0 || index >= items.length) {
      return;
    }

    setStoreState((state) => {
      state.items[index] = factory(state.items[index]);
    });
  };

  const updateSelectedItem = (factory: (item: Item) => Item) => {
    const { selected } = storeApi.getState();
    if (selected === undefined) {
      return;
    }

    updateItem(selected, factory);
  };

  const moveItem = (from: Index, to: Index) => {
    setStoreState((state) => {
      const target = state.items.splice(from, 1);
      state.items.splice(to, 0, ...target);
    });
  };

  const deleteItem = (index: Index) => {
    setStoreState((state) => {
      state.items.splice(index, 1);
    });
  };

  const toggleDragging = (dragging?: boolean) => {
    if (dragging === undefined) {
      setStoreState((state) => ({ dragging: !state.dragging }));
    } else {
      storeApi.setState({ dragging });
    }
  };

  return {
    selectItem: (index: number) => {
      setStoreState((state) => {
        if (index < 0 || index >= state.items.length) {
          return;
        }
        state.selected = index;
      });
    },
    updateItem,
    updateSelectedItem,
    moveItem,
    deleteItem,
    toggleDragging,
  };
}

type IStoreActions = ReturnType<typeof createStoreActions>;

export type { IStoreActions };

export { shallow, createStoreState, createStoreActions };
