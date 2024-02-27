import { ReloadIcon } from "@radix-ui/react-icons";
import { open } from "@tauri-apps/api/dialog";
import { emit } from "@tauri-apps/api/event";
import { nanoid } from "nanoid/non-secure";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useBoolean } from "react-use";
import { Button } from "subcat/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "subcat/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "subcat/components/ui/form";
import { Input } from "subcat/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "subcat/components/ui/select";
import { Slider } from "subcat/components/ui/slider";
import { useTauriEventListener } from "subcat/hooks";
import { store } from "subcat/store";
import { SubcatEvent } from "subcat_event";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export interface ISaveAsModalRef {
  open: () => void;
}

export const SaveAsModal = forwardRef<ISaveAsModalRef, unknown>(
  (_props, ref) => {
    const [visible, toggleVisible] = useBoolean(false);
    const [generating, setGenerating] = useBoolean(false);

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

    useImperativeHandle(ref, () => {
      return {
        open: () => {
          form.reset();
          const defaultFilename = "subcat_" + nanoid(7);
          form.setValue("filename", defaultFilename);
          const defaultFormat = "JPG";
          form.setValue("format", defaultFormat);
          toggleVisible(true);
        },
      };
    });

    useTauriEventListener(SubcatEvent.BeGenerateRes, () => {
      setGenerating(false);
      toggleVisible(false);
    });

    const handleGenerate = () => {
      const { saveto, filename, format, quality, compressType } =
        form.getValues();
      const items = store.getState().items;
      if (items.length) {
        setGenerating(true);
        emit(SubcatEvent.FeGenerate, {
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

    return (
      <Dialog open={visible} onOpenChange={toggleVisible}>
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
                        disabled={generating}
                      >
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
                      disabled={generating}
                    >
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
                    <FormLabel>Quality({field.value}%)</FormLabel>
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
                        disabled={generating}
                      >
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
              onClick={handleGenerate}
            >
              {generating ? <ReloadIcon className="mr-2 animate-spin" /> : null}
              Save
            </Button>
            <DialogClose disabled={generating}>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

SaveAsModal.displayName = "SaveAsModal";
