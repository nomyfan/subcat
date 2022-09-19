import { Layout } from "./Layout";
import { Content } from "./Content";
import { Preview } from "./Preview";
import { AppContext, useStoreCreation } from "./store";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { emit, listen } from "@tauri-apps/api/event";
import { Dropdown, Menu, Modal, Form, Input, Button } from "antd";
import { useRef, useState } from "react";
import { useMount } from "react-use";

function valueInRange(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function App() {
  const batch = useRef(0);
  const store = useStoreCreation();
  const { getValue, useStore } = store;

  const emptySelection = useStore((st) => !st.items.length).store;

  const [visible, setVisible] = useState(false);
  const hide = () => setVisible(false);
  const show = () => setVisible(true);

  const [form] = Form.useForm<{ filename: string; saveto: string }>();

  useMount(() => {
    let disposed = false;
    let disposeFn: (() => void) | undefined = undefined;
    const dispose = () => {
      if (disposed) {
        return;
      }

      disposed = true;
      disposeFn?.();
    };
    (async () => {
      disposeFn = await listen("be-generate-ok", () => {
        if (!disposed) {
          setVisible(false);
        }
      });
      if (disposed) {
        disposeFn();
      }
    })();

    return () => dispose();
  });

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

  const handleGenerate = async () => {
    const { saveto, filename } = await form.validateFields();
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
        dir: saveto,
        filename,
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
      form.setFieldsValue({ saveto: dir });
    }
  };

  const menus = (
    <Menu
      items={[
        {
          key: "select_images",
          label: "Select images",
          onClick: () => handleSelectImages(),
        },
        {
          key: "save_as",
          label: "Save as",
          onClick: () => {
            form.resetFields();
            show();
          },
          disabled: emptySelection,
        },
      ]}
    />
  );

  return (
    <AppContext.Provider value={store}>
      <Layout
        head={
          <div className="bg-gray-100">
            <Dropdown overlay={menus} trigger={["click"]}>
              <Button type="text" className="font-bold">
                FILES
              </Button>
            </Dropdown>
          </div>
        }
        content={<Content />}
        preview={<Preview />}
      />
      <Modal
        title="Save as"
        open={visible}
        onCancel={() => hide()}
        onOk={() => handleGenerate()}>
        <Form form={form} labelCol={{ span: 8 }}>
          <Form.Item
            label="File name"
            name="filename"
            rules={[{ required: true }]}>
            <Input
              onChange={(evt) => {
                const filename = evt.target.value;
                form.setFieldsValue({ filename });
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Button type="dashed" onClick={() => handleSaveTo()}>
                Select directory
              </Button>
            }
            name="saveto"
            rules={[{ required: true }]}>
            <Input disabled value={form.getFieldValue("saveto")} />
          </Form.Item>
        </Form>
      </Modal>
    </AppContext.Provider>
  );
}

export default App;
