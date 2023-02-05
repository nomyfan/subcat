import {
  DragDropContext,
  Droppable,
  Draggable,
  type DragDropContextProps,
} from "react-beautiful-dnd";
import { useAppStore, shallow } from "./store";

function ThumbnailList() {
  const {
    state: { items, selected },
    actions,
  } = useAppStore(
    (st) => ({ items: st.items, selected: st.selected }),
    shallow,
  );

  const handleDragEnd: DragDropContextProps["onDragEnd"] = (evt) => {
    if (!evt.destination) {
      return;
    }
    const {
      source: { index: fromIndex },
      destination: { index: toIndex },
    } = evt;

    actions.moveItem(fromIndex, toIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="thumbnailList">
        {(provided) => {
          return (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((it, index) => {
                return (
                  <Draggable key={it.id} draggableId={it.id} index={index}>
                    {(provided) => {
                      return (
                        <img
                          alt=""
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`w-full h-[200px] object-contain border-0 border-t-2 border-solid block cursor-pointer hover:bg-neutral-900 ${
                            selected === index ? "bg-neutral-900" : ""
                          }`}
                          src={it.src}
                          onLoad={(evt) => {
                            actions.updateItem(index, (item) => {
                              return {
                                ...item,
                                height: evt.currentTarget.naturalHeight,
                                width: evt.currentTarget.naturalWidth,
                              };
                            });
                          }}
                          onClick={() => actions.selectItem(index)}
                        />
                      );
                    }}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}

export { ThumbnailList };
