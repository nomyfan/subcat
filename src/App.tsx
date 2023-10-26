import type { DragDropContextProps } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { emit } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { useTauriEventListener } from "subcat/hooks";
import { SubcatEvent } from "subcat_event";

import { Content } from "./components/Content";
import { Layout } from "./components/Layout";
import { Preview } from "./components/Preview";
import type { ISaveAsModalRef } from "./components/SaveAsModal";
import { SaveAsModal } from "./components/SaveAsModal";
import { ThumbnailList } from "./components/ThumbnailList";
import { store } from "./store";
import * as storeActions from "./storeActions";

function App() {
  useEffect(() => {
    let isEmpty: boolean = store.getState().items.length === 0;
    emit(SubcatEvent.FeMenuDisable, { id: "save_as", disabled: isEmpty });
    store.subscribe((state, prevState) => {
      if (state.items !== prevState.items) {
        const isEmptyNow = state.items.length === 0;
        if (isEmptyNow !== isEmpty) {
          isEmpty = isEmptyNow;
          emit(SubcatEvent.FeMenuDisable, { id: "save_as", disabled: isEmpty });
        }
      }
    });
  }, []);

  const modalRef = useRef<ISaveAsModalRef>(null);

  useTauriEventListener<"open" | "save_as">(
    SubcatEvent.BeMenuSelect,
    ({ payload }) => {
      switch (payload) {
        case "open": {
          storeActions.selectImages();
          break;
        }
        case "save_as": {
          modalRef.current?.open();
        }
      }
    },
  );

  const handleDragStart: DragDropContextProps["onDragStart"] = (evt) => {
    storeActions.toggleDragging(evt.draggableId);
  };

  const handleDragEnd: DragDropContextProps["onDragEnd"] = (evt) => {
    if (!evt.destination) {
      return;
    }

    const {
      source: { index: fromIndex },
      destination: { index: toIndex },
    } = evt;

    storeActions.moveItem(fromIndex, toIndex);
    storeActions.toggleDragging();
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Layout
        head={null}
        left={<ThumbnailList />}
        middle={<Content />}
        right={<Preview />}
      />
      <SaveAsModal ref={modalRef} />
    </DragDropContext>
  );
}

export { App };
