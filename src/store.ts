import { createStore, useStore } from "zustand";
import shallow from "zustand/shallow";
import { createContext, useContext, useRef } from "react";
import type { StoreState, Item, Index } from "./types";

function create() {
  const storeApi = createStore<StoreState>(() => {
    return { items: [], dragging: false };
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

  const moveItem = (from: Index, to: Index) => {
    const items = storeApi.getState().items.slice();
    const target = items.splice(from, 1);
    items.splice(to, 0, ...target);

    storeApi.setState({ items });
  };

  const deleteItem = (index: Index) => {
    const items = storeApi.getState().items.slice();
    items.splice(index, 1);

    storeApi.setState({ items });
  };

  const toggleDragging = (dragging?: boolean) => {
    if (dragging === undefined) {
      storeApi.setState({ dragging: !storeApi.getState().dragging });
    } else {
      storeApi.setState({ dragging });
    }
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
