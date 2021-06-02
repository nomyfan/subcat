use anyhow::Result;
use image::{GenericImage, ImageBuffer, RgbaImage};
use serde::{Deserialize, Serialize};
use std::io::Read;

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

fn load_config(config_path: Option<String>) -> Result<Config> {
    let path = config_path.unwrap_or_else(|| "./config.json".into());
    let mut config_file = std::fs::File::open(path)?;
    let mut raw_config = String::new();
    config_file.read_to_string(&mut raw_config)?;

    let config: Config = serde_json::from_str(&raw_config)?;

    Ok(config)
}

fn main() -> Result<()> {
    let config = load_config(None)?;
    if config.imgs.is_empty() {
        eprintln!("No images specified, please check the config file.");
        std::process::exit(1);
    }

    let mut final_height = 0u32;
    let mut final_width = 0u32;
    let mut images = vec![];
    for img_config in &config.imgs {
        let mut img = image::open(img_config.path.to_string()).unwrap();

        let sub_image = img.sub_image(
            img_config.offset_x,
            img_config.offset_y,
            img_config.width,
            img_config.height,
        );
        images.push(sub_image.to_image());

        final_height += img_config.height;
        final_width = final_width.max(img_config.width);
    }

    let mut final_img: RgbaImage = ImageBuffer::new(final_width, final_height);
    let mut y_offset = 0u32;

    for img in &images {
        final_img.copy_from(img, 0, y_offset)?;
        y_offset += img.dimensions().1;
    }

    final_img.save(config.save_to)?;

    Ok(())
}
