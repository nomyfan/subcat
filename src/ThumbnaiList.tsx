import { Droppable, Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import { useAppStore, shallow } from "./store";

function ThumbnailList() {
  const {
    state: { items, selected },
    actions,
  } = useAppStore(
    (st) => ({ items: st.items, selected: st.selected }),
    shallow,
  );

  return (
    <Droppable droppableId="thumbnailList">
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((it, index) => {
              return (
                <Draggable key={it.id} draggableId={it.id} index={index}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        className={classNames(
                          "border-0 border-t-2 border-solid block hover:bg-neutral-900",
                          {
                            "border-t-transparent": snapshot.isDragging,
                            "bg-neutral-900": selected === index,
                          },
                        )}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <img
                          alt=""
                          src={it.src}
                          className="w-full h-[200px] object-contain"
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
                      </div>
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
  );
}

export { ThumbnailList };
