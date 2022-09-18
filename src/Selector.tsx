import { PropsWithChildren, useRef } from "react";
import { Item } from "./types";

const MIN_MIDDLE = 10;

interface Heights {
  middle: number;
  bottom: number;
}

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function Selector(
  props: PropsWithChildren<{
    item: Item;
    setHeights: (factory: (state: Heights) => Heights) => void;
  }>,
) {
  const { item, setHeights } = props;

  const ref = useRef<
    | { sy: number; middle: number; bottom: number; cursor: "bottom" | "top" }
    | undefined
  >();

  const rootElementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootElementRef}
      className="relative not-last:mb-5"
      onMouseUp={() => {
        ref.current = undefined;
      }}
      onMouseLeave={() => {
        ref.current = undefined;
      }}
      onMouseMove={(evt) => {
        const current = ref.current;
        const rootElement = rootElementRef.current;
        if (!current || !rootElement) {
          return;
        }

        const clientHeight = rootElement.clientHeight;

        const dy = evt.pageY - current.sy;
        const dyPect = (dy / clientHeight) * 100;
        console.log(dy, dyPect);

        // TODO: optimize
        if (current.cursor === "top") {
          const middle = valueInRange(current.middle - dyPect);
          if (middle * clientHeight <= MIN_MIDDLE) {
            return;
          }
          setHeights((hs) => {
            return { ...hs, middle };
          });
        } else {
          const middle = valueInRange(current.middle + dyPect);
          if (middle * clientHeight <= MIN_MIDDLE) {
            return;
          }
          setHeights(() => ({
            middle,
            bottom: valueInRange(current.bottom - dyPect),
          }));
        }
      }}>
      {props.children}
      <div className="absolute top-0 left-0 h-full w-full flex flex-col">
        <div
          style={{
            backgroundColor: "hsla(0, 100%, 0%, 0.6)",
            height: `calc(100% - ${item.middle + item.bottom}%)`,
          }}
        />
        <div
          className="divider"
          onMouseDown={(evt) => {
            console.log("evt.pageY", evt.pageY);
            ref.current = {
              cursor: "top",
              sy: evt.pageY,
              middle: item.middle,
              bottom: item.bottom,
            };
            console.log("down");
          }}
        />
        <div
          style={{
            flexGrow: 1,
          }}
        />
        <div
          className="divider"
          onMouseDown={(evt) => {
            console.log("evt.pageY", evt.pageY);
            ref.current = {
              cursor: "bottom",
              sy: evt.pageY,
              middle: item.middle,
              bottom: item.bottom,
            };
            console.log("down");
          }}
        />
        <div
          style={{
            backgroundColor: "hsla(0, 100%, 0%, 0.6)",
            height: `${item.bottom}%`,
          }}
        />
      </div>
    </div>
  );
}

export { Selector };
