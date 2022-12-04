import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";
import { createContext, useContext, useRef } from "react";
import type { StoreState, Item } from "./types";

function create() {
  const storeApi = createStore<StoreState>(() => {
    return { items: [] };
  });

  const updateItem = (index: number, factory: (item: Item) => Item) => {
    const { items } = storeApi.getState();
    if (index < 0 || index >= items.length) {
      return;
    }

    storeApi.setState({
      items: [
        ...items.slice(0, index),
        { ...items[index], ...factory(items[index]) },
        ...items.slice(index + 1),
      ],
    });
  };

  const updateSelectedItem = (factory: (item: Item) => Item) => {
    const { selected } = storeApi.getState();
    if (selected === undefined) {
      return;
    }

    updateItem(selected, factory);
  };

  return {
    storeApi,
    actions: {
      selectItem: (index: number) => {
        if (index < 0 || index >= storeApi.getState().items.length) {
          return;
        }
        storeApi.setState({ selected: index });
      },
      updateItem,
      updateSelectedItem,
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
