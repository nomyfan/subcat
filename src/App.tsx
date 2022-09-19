import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { AppContext, useStoreCreation } from "./store";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { emit } from "@tauri-apps/api/event";
import { useState } from "react";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function App() {
  const store = useStoreCreation();
  const { getValue } = store;

  const [saveTo, setSaveTo] = useState("");

  const handleSelectImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      recursive: false,
      title: "选择截图",
      filters: [{ name: "images", extensions: ["jpg", "jpeg", "png"] }],
    });
    if (files) {
      const fileUrls = Array.isArray(files) ? files : [files];
      store.next((st) => {
        return {
          ...st,
          items: fileUrls.map((url, i) => {
            const src = convertFileSrc(url);
            return {
              id: `${src}_${i}`,
              url,
              src,
              height: 0,
              width: 0,
              middle: i === 0 ? 100 : 10,
              bottom: 0,
            };
          }),
        };
      });
    }
  };

  const handleGenerate = async () => {
    const items = getValue().items;
    if (items.length) {
      await emit("fe-subcat-generate", {
        imgs: items.map((it) => {
          const { url, middle, bottom, width, height } = it;

          const pct = valueInRange(100 - middle - bottom) / 100;

          return {
            path: url,
            offsetY: Math.floor(height * pct),
            width,
            height: Math.floor((height * middle) / 100),
          };
        }),
        saveTo,
      });
    }
  };

  return (
    <AppContext.Provider value={store}>
      <Layout
        head={
          <>
            <button onClick={handleSelectImages}>Select images</button>
            <input
              value={saveTo}
              onChange={(evt) => {
                setSaveTo(evt.target.value);
              }}
            />
            <button onClick={handleGenerate}>Ok</button>
          </>
        }
        content={<Content />}
        preview={<Preview />}
      />
    </AppContext.Provider>
  );
}

export default App;
