import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";
import { produce } from "immer";
import { createContext, useContext, useRef } from "react";
import type { StoreState, Item, Index } from "./types";

function create() {
  const storeApi = createStore<StoreState>(() => {
    return { items: [], dragging: false };
  });

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
    storeApi,
    actions: {
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
    },
  };
}

function useStoreCreation() {
  const ref = useRef<{ value: ReturnType<typeof create> }>();
  if (!ref.current) {
    ref.current = { value: create() };
  }

  return ref.current!.value;
}

const AppContext = createContext<ReturnType<typeof create>>(create());

const useAppContext = () => useContext(AppContext);

function useAppStore<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  const { storeApi, actions } = useAppContext();
  const state = useStore(storeApi, selector, equalityFn);

  return {
    state,
    actions,
    storeApi,
    setStoreState: storeApi.setState,
    getStoreState: storeApi.getState,
  };
}

function useAppStoreState<U>(
  selector: (state: StoreState) => U,
  equalityFn?: (prev: U, cur: U) => boolean,
) {
  return useAppStore(selector, equalityFn).state;
}

export {
  useStoreCreation,
  AppContext,
  useAppStore,
  useAppStoreState,
  useAppContext,
  shallow,
};
