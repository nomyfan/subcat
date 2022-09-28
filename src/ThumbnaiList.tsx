import { useAppContext } from "./store";

function ThumbnailList() {
  const { useStore } = useAppContext();
  const {
    store: { items, selected },
    setStore,
  } = useStore(
    (st) => ({ items: st.items, selected: st.selected }),
    (prev, cur) => {
      return prev.items === cur.items && prev.selected === cur.selected;
    },
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
              setStore((st) => {
                return {
                  ...st,
                  items: [
                    ...items.slice(0, index),
                    {
                      ...it,
                      height: evt.currentTarget.naturalHeight,
                      width: evt.currentTarget.naturalWidth,
                    },
                    ...items.slice(index + 1),
                  ],
                };
              });
            }}
            onClick={() => setStore((st) => ({ ...st, selected: index }))}
          />
        );
      })}
    </>
  );
}

export { ThumbnailList };
