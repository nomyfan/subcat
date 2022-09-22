import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { AppContext, useStoreCreation } from "./store";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { emit, listen } from "@tauri-apps/api/event";
import { useRef } from "react";
import { useBoolean, useAsync } from "react-use";
import {
  CommandButton,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  type IContextualMenuProps,
  PrimaryButton,
  Spinner,
  TextField,
} from "@fluentui/react";
import { useForm, Controller } from "react-hook-form";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function App() {
  const batch = useRef(0);
  const store = useStoreCreation();
  const { getValue, useStore } = store;

  const emptySelection = useStore((st) => !st.items.length).store;

  const [visible, toggleVisible] = useBoolean(false);
  const [generating, setGenerating] = useBoolean(false);

  useAsync(async () => {
    const handler: Parameters<typeof listen>[1] = () => {
      setGenerating(false);
      toggleVisible(false);
    };

    const unsub = await listen("be-subcat-generate", handler);

    return () => unsub();
  }, []);

  const form = useForm<{ filename: string; saveto: string }>();
  const formValues = form.watch();

  const handleSelectImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      recursive: false,
      title: "Select images",
      filters: [{ name: "images", extensions: ["jpg", "jpeg", "png"] }],
    });
    if (files) {
      const fileUrls = Array.isArray(files) ? files : [files];
      store.next((st) => {
        batch.current++;
        return {
          ...st,
          items: fileUrls.map((url, i) => {
            const src = convertFileSrc(url);
            return {
              id: `${src}_${i}_${batch.current}`,
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

  const handleGenerate = () => {
    const { saveto, filename } = formValues;
    const items = getValue().items;
    if (items.length) {
      setGenerating(true);
      emit("fe-subcat-generate", {
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
        dir: saveto,
        filename,
      }).catch(() => {
        setGenerating(false);
      });
    }
  };

  const handleSaveTo = async () => {
    const dir = await open({
      multiple: false,
      directory: true,
      recursive: false,
      title: "Save to",
    });

    if (typeof dir === "string") {
      form.setValue("saveto", dir);
    }
  };

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: "select_images",
        text: "Select images",
        onClick: () => {
          handleSelectImages();
        },
      },
      {
        key: "save_as",
        text: "Save as",
        onClick: () => {
          form.reset();
          toggleVisible(true);
        },
        disabled: emptySelection,
      },
    ],
  };

  return (
    <AppContext.Provider value={store}>
      <Layout
        head={
          <div className="bg-gray-100">
            <CommandButton menuProps={menuProps}>FILES</CommandButton>
          </div>
        }
        content={<Content />}
        preview={<Preview />}
      />

      <Dialog
        hidden={!visible}
        onDismiss={toggleVisible}
        dialogContentProps={{
          type: DialogType.largeHeader,
          title: "Save as",
        }}
        modalProps={{ isBlocking: true }}>
        <Controller
          name="filename"
          control={form.control}
          render={({ field }) => {
            return (
              <TextField
                disabled={generating}
                label="File name"
                required
                {...field}
              />
            );
          }}
        />

        <DefaultButton
          disabled={generating}
          className="mt-3 mb-1"
          onClick={() => handleSaveTo()}>
          Select directory
        </DefaultButton>
        <Controller
          control={form.control}
          render={({ field }) => {
            return <TextField required disabled {...field} />;
          }}
          name="saveto"
        />

        <DialogFooter>
          <PrimaryButton
            className="align-top"
            disabled={!formValues.filename || !formValues.saveto || generating}
            onClick={() => handleGenerate()}>
            {generating && <Spinner className="mr-1.5" />}
            <span>Save</span>
          </PrimaryButton>
          <DefaultButton
            disabled={generating}
            onClick={() => toggleVisible(false)}
            text="Cancel"
          />
        </DialogFooter>
      </Dialog>
    </AppContext.Provider>
  );
}

export default App;
