import { useAppStoreState } from "../hooks";
import * as storeActions from "../storeActions";

import { Selector } from "./Selector";

function Content() {
  const selectedItem = useAppStoreState((st) =>
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
          storeActions.updateSelectedItem((item) => {
            return { ...item, ...factory(item) };
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
