import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "subcat/lib/utils";
import { shallow } from "./store";
import * as storeActions from "./storeActions";
import { useAppStoreState } from "./hooks";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "subcat/components/ui/context-menu";
import { TrashIcon } from "@radix-ui/react-icons";

function ThumbnailList() {
  const { items, selected } = useAppStoreState(
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
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <div
                            ref={provided.innerRef}
                            className={cn(
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
                                storeActions.updateItem(index, (item) => {
                                  return {
                                    ...item,
                                    height: evt.currentTarget.naturalHeight,
                                    width: evt.currentTarget.naturalWidth,
                                  };
                                });
                              }}
                              onClick={() => storeActions.selectItem(index)}
                            />
                          </div>
                        </ContextMenuTrigger>

                        <ContextMenuContent>
                          <ContextMenuItem
                            onSelect={() => {
                              storeActions.deleteItem(index);
                            }}>
                            <TrashIcon className="mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
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
