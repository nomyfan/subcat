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
    <>
      {items.map((it, index) => {
        return (
          <img
            className={`w-full h-[200px] object-contain border-0 border-t-2 border-solid block cursor-pointer hover:bg-neutral-900 ${
              selected === index ? "bg-neutral-900" : ""
            }`}
            key={it.id}
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
      })}
    </>
  );
}

export { ThumbnailList };
