use anyhow::Result;
use image::{GenericImage, ImageBuffer, RgbaImage};
use serde::{Deserialize, Serialize};
use tokio::{fs, sync::mpsc::unbounded_channel, task};

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Image {
    pub(crate) path: String,
    #[serde(alias = "offsetY")]
    pub(crate) offset_y: u32,
    #[serde(alias = "offsetX")]
    pub(crate) offset_x: Option<u32>,
    pub(crate) width: u32,
    pub(crate) height: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Config {
    pub(crate) imgs: Vec<Image>,
    #[serde(alias = "saveTo")]
    pub(crate) save_to: String,
}

struct ImageMessage {
    order: usize,
    img: ImageBuffer<image::Rgba<u8>, Vec<u8>>,
}

pub(crate) async fn generate(config: Config) -> Result<()> {
    let Config { imgs, save_to } = config;
    let imgs_count = imgs.len();

    let (tx, mut rx) = unbounded_channel();

    println!("Loading images...");
    for (i, img_config) in imgs.iter().enumerate() {
        let order = i;
        let path = img_config.path.to_string();
        let y = img_config.offset_y;
        let width = img_config.width;
        let height = img_config.height;
        let tx = tx.clone();

        task::spawn(async move {
            match fs::read(path).await {
                Ok(file) => match image::load_from_memory(&file) {
                    Ok(mut img) => {
                        let sub_image = img.sub_image(0, y, width, height);
                        let msg = ImageMessage {
                            order,
                            img: sub_image.to_image(),
                        };
                        let _ = tx.send(Ok(msg));
                    }
                    Err(e) => {
                        let _ = tx.send(Err(anyhow::anyhow!(e)));
                    }
                },
                Err(e) => {
                    let _ = tx.send(Err(anyhow::anyhow!(e)));
                }
            }
        });
    }

    let mut final_height = 0u32;
    let mut final_width = 0u32;
    let mut images = Vec::with_capacity(imgs_count);
    for _ in 0..imgs_count {
        let msg = rx.recv().await.unwrap();
        match msg {
            Ok(msg) => {
                final_height += msg.img.height();
                final_width = final_width.max(msg.img.width());
                images.push(msg);
            }
            Err(e) => panic!("{:?}", e),
        }
    }
    images.sort_by(|a, b| a.order.cmp(&b.order));

    let mut final_img: RgbaImage = ImageBuffer::new(final_width, final_height);
    let mut y_offset = 0u32;

    println!("Generating...");
    for msg in &images {
        let img = &msg.img;
        final_img.copy_from(img, 0, y_offset)?;
        y_offset += img.dimensions().1;
    }

    println!("Saving...");
    final_img.save(save_to)?;

    Ok(())
}