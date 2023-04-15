import { useAppStoreState } from "./hooks";
import type { Item } from "./types";
import { useMeasure } from "react-use";

function PreviewItem(props: { item: Item }) {
  const { item } = props;

  const [ref, { width }] = useMeasure<HTMLDivElement>();

  const clientHeight = !item.width ? 0 : (width * item.height) / item.width;

  const displayClientHeight = clientHeight * (item.middle / 100);

  const backgroundPositionY =
    -((100 - (item.middle + item.bottom)) / 100) * clientHeight;

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: displayClientHeight,
        backgroundImage: `url(${item.src})`,
        backgroundSize: `100% auto`,
        backgroundRepeat: "no-repeat",
        backgroundPositionY: `${backgroundPositionY}px`,
      }}
    />
  );
}

function Preview() {
  const items = useAppStoreState((st) => st.items);

  return (
    <div>
      {items.map((it) => (
        <PreviewItem key={it.id} item={it} />
      ))}
    </div>
  );
}

export { Preview };
