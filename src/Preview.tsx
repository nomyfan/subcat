import { useAppContext } from "./store";
import type { Item } from "./types";
import { useState } from "react";

function PreviewItem(props: { item: Item }) {
  const { item } = props;

  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const backgroundHeight = element
    ? (element.clientWidth * item.height) / item.width
    : 0;

  const clientHeight = backgroundHeight * (item.middle / 100);

  return (
    <div
      ref={setElement}
      style={{
        width: "100%",
        height: clientHeight,
        backgroundImage: `url(${item.src})`,
        backgroundSize: `100% auto`,
        backgroundRepeat: "no-repeat",
        backgroundPositionY: `${
          -((100 - (item.middle + item.bottom)) / 100) * backgroundHeight
        }px`,
      }}></div>
  );
}

function Preview() {
  const { useStore } = useAppContext();

  const { store: items } = useStore((st) => st.items);

  return (
    <div>
      {items.map((it) => (
        <PreviewItem key={it.id} item={it} />
      ))}
    </div>
  );
}

export { Preview };
