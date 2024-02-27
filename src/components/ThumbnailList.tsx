import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TrashIcon, CopyIcon } from "@radix-ui/react-icons";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "subcat/components/ui/context-menu";
import { cn } from "subcat/lib/utils";

import { useAppStoreState } from "../hooks";
import { shallow } from "../store";
import * as storeActions from "../storeActions";

function ThumbnailList() {
  const { items, selected, draggingId } = useAppStoreState(
    (st) => ({
      items: st.items,
      selected: st.selected,
      draggingId: st.draggingId,
    }),
    shallow,
  );
  const isDragging = !!draggingId;

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
                              "border-y border-solid block bg-white hover:bg-neutral-200",
                              {
                                "border-t-transparent": snapshot.isDragging,
                                "bg-neutral-100": selected === index,
                              },
                              isDragging && "bg-white",
                              draggingId === it.id && "bg-neutral-200",
                            )}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
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
                              storeActions.syncConfigToBelow(index);
                            }}
                          >
                            <CopyIcon className="mr-2" />
                            Sync to below
                          </ContextMenuItem>

                          <ContextMenuItem
                            className="text-red-500 focus:text-red-500"
                            onSelect={() => {
                              storeActions.deleteItem(index);
                            }}
                          >
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
