import { Selector } from "./Selector";
import { useAppStore } from "./store";

function Content() {
  const { store: selectedItem, setStore } = useAppStore((st) =>
    st.selected === undefined ? undefined : st.items[st.selected],
  );

  if (!selectedItem) {
    return null;
  }

  return (
    <div className="h-full overflow-auto">
      <Selector
        key={selectedItem.id}
        item={selectedItem}
        setHeights={(factory) => {
          setStore((st) => {
            const index = st.items.findIndex((it) => it === selectedItem);
            return {
              items: [
                ...st.items.slice(0, index),
                { ...selectedItem, ...factory(selectedItem) },
                ...st.items.slice(index + 1),
              ],
            };
          });
        }}>
        <img
          src={selectedItem.src}
          alt=""
          style={{
            width: "100%",
            objectFit: "contain",
            objectPosition: "bottom",
            display: "block", // Remove extra 4px from baseline to bottom. Also, we can set vertical-align: top to fix this.
          }}
        />
      </Selector>
    </div>
  );
}

export { Content };
