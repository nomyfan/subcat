import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { AppStoreProvider } from "./AppStoreProvider";
import { useAppStore } from "./hooks";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { emit, listen } from "@tauri-apps/api/event";
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
  Dropdown,
} from "@fluentui/react";
import { useForm, Controller } from "react-hook-form";
import { ThumbnailList } from "./ThumbnaiList";
import { Trash } from "./Trash";
import { DragDropContext, type DragDropContextProps } from "@hello-pangea/dnd";
import { nanoid } from "nanoid/non-secure";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

const formatOptions = [
  { key: "JPG", text: "JPG" },
  { key: "PNG", text: "PNG" },
];

function App() {
  const {
    state: emptySelection,
    getStoreState,
    setStoreState,
    actions,
  } = useAppStore((st) => !st.items.length);

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

  const form = useForm<{
    filename: string;
    saveto: string;
    format: "JPG" | "PNG";
  }>({
    defaultValues: { filename: "", saveto: "", format: "JPG" },
  });
  const formValues = form.watch();

  const handleSelectImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      recursive: false,
      title: "Open",
      filters: [{ name: "images", extensions: ["jpg", "jpeg", "png"] }],
    });
    if (files) {
      const fileUrls = Array.isArray(files) ? files : [files];
      const items = getStoreState().items;

      const newItems = fileUrls
        .filter((url) => {
          return !items.find((it) => it.url === url);
        })
        .map((url, i) => {
          const src = convertFileSrc(url);
          return {
            id: url,
            url,
            src,
            height: 0,
            width: 0,
            middle: i === 0 && items.length === 0 ? 100 : 10,
            bottom: 0,
          };
        });

      if (newItems.length) {
        setStoreState((st) => {
          return {
            selected: st.selected ?? 0,
            items: st.items.concat(newItems),
          };
        });
      }
    }
  };

  const handleGenerate = () => {
    const { saveto, filename, format } = formValues;
    const items = getStoreState().items;
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
        format,
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
        text: "Open",
        onClick: () => {
          handleSelectImages();
        },
      },
      {
        key: "save_as",
        text: "Save as",
        onClick: () => {
          form.reset();
          const defaultFilename = nanoid(7);
          form.setValue("filename", defaultFilename);
          const defaultFormat = "JPG";
          form.setValue("format", defaultFormat);
          toggleVisible(true);
        },
        disabled: emptySelection,
      },
    ],
  };

  const handleDragStart: DragDropContextProps["onBeforeCapture"] = () => {
    actions.toggleDragging(true);
  };

  const handleDragEnd: DragDropContextProps["onDragEnd"] = (evt) => {
    if (!evt.destination) {
      return;
    }

    const {
      source: { index: fromIndex },
      destination: { index: toIndex },
    } = evt;

    if (evt.destination.droppableId === "trash") {
      actions.deleteItem(fromIndex);
    } else {
      actions.moveItem(fromIndex, toIndex);
    }

    actions.toggleDragging(false);
  };

  return (
    <DragDropContext
      onBeforeCapture={handleDragStart}
      onDragEnd={handleDragEnd}>
      <Layout
        head={
          <div className="bg-gray-100">
            <CommandButton menuProps={menuProps}>FILES</CommandButton>
          </div>
        }
        left={<ThumbnailList />}
        middle={<Content />}
        right={<Preview />}
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

        <Controller
          name="format"
          control={form.control}
          render={({ field }) => {
            return (
              <Dropdown
                disabled={generating}
                label="Format"
                required
                options={formatOptions}
                selectedKey={field.value}
                onChange={(_, opt) => {
                  if (opt) {
                    form.setValue("format", opt.key as "JPG" | "PNG");
                  }
                }}
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

      <Trash />
    </DragDropContext>
  );
}

export default function AppWithStore() {
  return (
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  );
}
