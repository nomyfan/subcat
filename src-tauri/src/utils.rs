use anyhow::Result;
use async_std::{channel, fs, task};
use image::{GenericImage, ImageBuffer, RgbaImage};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Image {
    path: String,
    #[serde(alias = "offsetY")]
    offset_y: u32,
    #[serde(alias = "offsetX")]
    offset_x: u32,
    width: u32,
    height: u32,
}

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    imgs: Vec<Image>,
    #[serde(alias = "saveTo")]
    save_to: String,
}

async fn load_config(config_path: &str) -> Result<Config> {
    let raw_config = fs::read_to_string(config_path).await?;
    let config: Config = serde_json::from_str(&raw_config)?;

    Ok(config)
}

fn cli<'a, 'b>() -> App<'a, 'b> {
    App::new("subcat")
        .author("Kim Chan(@nomyfan)")
        .version("0.1.0")
        .about("A utility to concatenate subtitles")
        .arg(
            Arg::with_name("config")
                .short("c")
                .long("config")
                .value_name("FILE")
                .help("Config file")
                .default_value("./config.json"),
        )
}

struct ImageMessage {
    order: usize,
    img: ImageBuffer<image::Rgba<u8>, Vec<u8>>,
}

async fn run() -> Result<()> {
    let app = cli();
    let matches = app.get_matches();

    let config = load_config(matches.value_of("config").unwrap()).await?;
    if config.imgs.is_empty() {
        eprintln!("No image specified, please check the config file.");
        std::process::exit(1);
    }

    let (tx, rx) = channel::unbounded();

    println!("Loading images...");
    for (i, img_config) in config.imgs.iter().enumerate() {
        let order = i;
        let path = img_config.path.to_string();
        let x = img_config.offset_x;
        let y = img_config.offset_y;
        let width = img_config.width;
        let height = img_config.height;
        let tx = tx.clone();

        task::spawn(async move {
            match fs::read(path).await {
                Ok(file) => match image::load_from_memory(&file) {
                    Ok(mut img) => {
                        let sub_image = img.sub_image(x, y, width, height);
                        let msg = ImageMessage {
                            order,
                            img: sub_image.to_image(),
                        };
                        let _ = tx.send(Ok(msg)).await;
                    }
                    Err(e) => {
                        let _ = tx.send(Err(anyhow::anyhow!(e))).await;
                    }
                },
                Err(e) => {
                    let _ = tx.send(Err(anyhow::anyhow!(e))).await;
                }
            }
        });
    }

    let mut final_height = 0u32;
    let mut final_width = 0u32;
    let mut images = Vec::with_capacity(config.imgs.len());
    for _ in 0..config.imgs.len() {
        let msg = rx.recv().await.unwrap();
        match msg {
            Ok(msg) => {
                final_height += msg.img.height();
                final_width = final_width.max(msg.img.width());
                images.push(msg);
            }
            Err(e) => {
                panic!("{}", e);
            }
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
    final_img.save(config.save_to)?;

    Ok(())
}
