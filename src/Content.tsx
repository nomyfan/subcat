import { Selector } from "./Selector";
import { useAppContext } from "./store";

function Content() {
  const { useStore } = useAppContext();
  const { store: items, setStore } = useStore((st) => st.items);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
      {items.map((it, i) => {
        return (
          <Selector
            key={it.id}
            item={it}
            setHeights={(factory) => {
              setStore((st) => {
                return {
                  ...st,
                  items: [
                    ...items.slice(0, i),
                    { ...it, ...factory(it) },
                    ...items.slice(i + 1),
                  ],
                };
              });
            }}>
            <img
              src={it.src}
              alt=""
              onLoad={(evt) => {
                setStore((st) => {
                  return {
                    ...st,
                    items: [
                      ...items.slice(0, i),
                      {
                        ...it,
                        height: evt.currentTarget.naturalHeight,
                        width: evt.currentTarget.naturalWidth,
                      },
                      ...items.slice(i + 1),
                    ],
                  };
                });
              }}
              style={{
                width: "100%",
                objectFit: "contain",
                objectPosition: "bottom",
                display: "block", // Remove extra 4px from baseline to bottom. Also, we can set vertical-align: top to fix this.
              }}
            />
          </Selector>
        );
      })}
    </div>
  );
}

export { Content };
