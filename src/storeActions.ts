import { open } from "@tauri-apps/api/dialog";
import { store } from "./store";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import type { Item, Index } from "./types";

export async function selectImages() {
  const files = await open({
    multiple: true,
    directory: false,
    recursive: false,
    title: "Open",
    filters: [{ name: "images", extensions: ["jpg", "jpeg", "png"] }],
  });
  if (files) {
    const fileUrls = Array.isArray(files) ? files : [files];
    const items = store.getState().items;

    const newItems = fileUrls
      .filter((url) => {
        return !items.find((it) => it.url === url);
      })
      .map((url, i) => {
        const src = convertFileSrc(url);
        return {
          id: url,
          url,
          src,
          height: 0,
          width: 0,
          middle: i === 0 && items.length === 0 ? 100 : 10,
          bottom: 0,
        };
      });

    if (newItems.length) {
      store.setState((st) => {
        return {
          selected: st.selected ?? 0,
          items: st.items.concat(newItems),
        };
      });
    }
  }
}

export function selectItem(index: number) {
  store.setState((state) => {
    if (index < 0 || index >= state.items.length) {
      return;
    }
    state.selected = index;
  });
}

export function updateItem(index: number, factory: (item: Item) => Item) {
  const { items } = store.getState();
  if (index < 0 || index >= items.length) {
    return;
  }

  store.setState((state) => {
    state.items[index] = factory(state.items[index]);
  });
}

export function updateSelectedItem(factory: (item: Item) => Item) {
  const { selected } = store.getState();
  if (selected === undefined) {
    return;
  }

  updateItem(selected, factory);
}

export function moveItem(from: Index, to: Index) {
  store.setState((state) => {
    const target = state.items.splice(from, 1);
    state.items.splice(to, 0, ...target);
  });
}

export function deleteItem(index: Index) {
  store.setState((state) => {
    state.items.splice(index, 1);
  });
}
