use crate::model::{Format, GenerateEventArgs, ImageInfo, PngCompressType};
use anyhow::Result;
use image::{
    codecs::{
        jpeg::JpegEncoder,
        png::{CompressionType, FilterType, PngEncoder},
    },
    GenericImage, ImageBuffer,
};
use tokio::{fs, sync::mpsc::channel, task};

struct OrderMessage {
    order: usize,
    img: ImageBuffer<image::Rgba<u8>, Vec<u8>>,
}

pub(crate) async fn generate(args: GenerateEventArgs) -> Result<()> {
    let GenerateEventArgs {
        imgs,
        dir,
        filename,
        format,
    } = args;
    let imgs_count = imgs.len();

    let (tx, mut rx) = channel::<Result<OrderMessage>>(imgs_count);

    println!("Loading images...");
    for (order, img_info) in imgs.into_iter().enumerate() {
        let tx = tx.clone();

        task::spawn(async move {
            let ImageInfo {
                path,
                offset_y: y,
                width,
                height,
                ..
            } = img_info;
            let result = fs::read(path)
                .await
                .map_err(|e| anyhow::anyhow!(e))
                .and_then(|file| {
                    image::load_from_memory(&file)
                        .map_err(|e| anyhow::anyhow!(e))
                        .map(|mut img| {
                            let img = img.sub_image(0, y, width, height).to_image();
                            OrderMessage { order, img }
                        })
                });
            let _ = tx.send(result).await;
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

    println!("Generating...");
    let mut final_img = ImageBuffer::new(final_width, final_height);
    let mut y_offset = 0u32;
    for msg in &images {
        let img = &msg.img;
        final_img.copy_from(img, 0, y_offset)?;
        y_offset += img.dimensions().1;
    }

    println!("Saving...");
    let save_to = std::path::Path::new(&dir).join(
        filename
            + match format {
                Format::Jpg(_) => ".jpg",
                Format::Png(_) => ".png",
            },
    );

    let writer = std::fs::File::create(save_to)?;

    match format {
        Format::Png(compress_type) => {
            let encoder = PngEncoder::new_with_quality(
                writer,
                match compress_type {
                    PngCompressType::Fast => CompressionType::Fast,
                    PngCompressType::Best => CompressionType::Best,
                },
                FilterType::Adaptive,
            );
            final_img.write_with_encoder(encoder)?;
        }
        Format::Jpg(quality) => {
            let encoder = JpegEncoder::new_with_quality(writer, quality);
            final_img.write_with_encoder(encoder)?;
        }
    };

    Ok(())
}
