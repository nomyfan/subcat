import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { AppContext, useStoreCreation } from "./store";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

function App() {
  const store = useStoreCreation();
  const { getValue } = store;

  const content = <Content />;
  const preview = <Preview />;

  return (
    <AppContext.Provider value={store}>
      <button
        onClick={() => {
          open({
            multiple: true,
            directory: false,
            recursive: false,
            title: "选择截图",
            filters: [{ name: "images", extensions: ["jpg", "jpeg", "png"] }],
          }).then((files) => {
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
                      middle: 10,
                      bottom: 0,
                    };
                  }),
                };
              });
            }
          });
        }}>
        Select images
      </button>
      <button
        onClick={() => {
          console.log("__DEBUG__ onOk", getValue());
        }}>
        Ok
      </button>
      <Layout content={content} preview={preview} />
    </AppContext.Provider>
  );
}

export default App;
