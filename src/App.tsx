import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { open } from "@tauri-apps/api/dialog";
import { emit, listen } from "@tauri-apps/api/event";
import { useBoolean, useAsync } from "react-use";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { ThumbnailList } from "./ThumbnailList";
import { DragDropContext, type DragDropContextProps } from "@hello-pangea/dnd";
import { nanoid } from "nanoid/non-secure";
import {
  Dialog,
  DialogTitle,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "subcat/components/ui/dialog";
import { Button } from "subcat/components/ui/button";
import { Input } from "subcat/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "subcat/components/ui/form";
import * as storeActions from "./storeActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "subcat/components/ui/select";
import { Slider } from "subcat/components/ui/slider";
import { useEffect } from "react";
import { store } from "./store";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function App() {
  useEffect(() => {
    let isEmpty: boolean = store.getState().items.length === 0;
    emit("fe-menu-disable", { id: "save_as", disabled: isEmpty });
    store.subscribe((state, prevState) => {
      if (state.items !== prevState.items) {
        const isEmptyNow = state.items.length === 0;
        if (isEmptyNow !== isEmpty) {
          isEmpty = isEmptyNow;
          emit("fe-menu-disable", { id: "save_as", disabled: isEmpty });
        }
      }
    });
  }, []);

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
    // For JPG format only
    quality: number;
    // For PNG format only
    compressType: "Best" | "Fast";
  }>({
    defaultValues: {
      filename: "",
      saveto: "",
      format: "JPG",
      quality: 90,
      compressType: "Fast",
    },
  });
  const formValues = form.watch();

  useAsync(async () => {
    const handler: Parameters<typeof listen>[1] = ({ payload }) => {
      switch (payload) {
        case "open": {
          storeActions.selectImages();
          break;
        }
        case "save_as": {
          form.reset();
          const defaultFilename = nanoid(7);
          form.setValue("filename", defaultFilename);
          const defaultFormat = "JPG";
          form.setValue("format", defaultFormat);
          toggleVisible(true);
          break;
        }
      }
    };
    const unsub = await listen("be-menu-select", handler);

    return () => unsub();
  }, [form]);

  const handleGenerate = () => {
    const { saveto, filename, format, quality, compressType } =
      form.getValues();
    const items = store.getState().items;
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
        format: {
          PNG: format === "PNG" ? compressType : undefined,
          JPG: format === "JPG" ? quality : undefined,
        },
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

  const handleDragStart: DragDropContextProps["onDragStart"] = (evt) => {
    storeActions.toggleDragging(evt.draggableId);
  };

  const handleDragEnd: DragDropContextProps["onDragEnd"] = (evt) => {
    if (!evt.destination) {
      return;
    }

    const {
      source: { index: fromIndex },
      destination: { index: toIndex },
    } = evt;

    storeActions.moveItem(fromIndex, toIndex);
    storeActions.toggleDragging();
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Layout
        head={null}
        left={<ThumbnailList />}
        middle={<Content />}
        right={<Preview />}
      />

      <Dialog open={visible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <FormField
              name="filename"
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        disabled={generating}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="format"
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={generating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JPG">JPG</SelectItem>
                          <SelectItem value="PNG">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="compressType"
              render={({ field }) => {
                if (formValues.format !== "PNG") {
                  return <></>;
                }
                return (
                  <FormItem>
                    <FormLabel>Compress Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={generating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fast">Fast</SelectItem>
                        <SelectItem value="Best">Best</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="quality"
              render={({ field }) => {
                if (formValues.format !== "JPG") {
                  return <></>;
                }

                return (
                  <FormItem>
                    <FormLabel>Quality</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value: [number]) => {
                          field.onChange(value[0]);
                        }}
                        disabled={generating}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="saveto"
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className="flex">
                      <Input
                        disabled
                        required
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <Button
                        className="ml-2"
                        onClick={handleSaveTo}
                        disabled={generating}>
                        Select directory
                      </Button>
                    </div>
                  </FormItem>
                );
              }}
            />
          </Form>

          <DialogFooter>
            <Button
              disabled={
                !formValues.filename || !formValues.saveto || generating
              }
              onClick={handleGenerate}>
              {generating ? <ReloadIcon className="mr-2 animate-spin" /> : null}
              Save
            </Button>
            <DialogClose
              disabled={generating}
              onClick={() => toggleVisible(false)}>
              Cancel
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DragDropContext>
  );
}

export default App;
