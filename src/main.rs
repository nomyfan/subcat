use anyhow::Result;
use clap::{App, Arg};
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

fn load_config(config_path: &str) -> Result<Config> {
    let mut config_file = std::fs::File::open(config_path)?;
    let mut raw_config = String::new();
    config_file.read_to_string(&mut raw_config)?;

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

fn main() -> Result<()> {
    let app = cli();
    let matches = app.get_matches();

    let config = load_config(matches.value_of("config").unwrap())?;
    if config.imgs.is_empty() {
        eprintln!("No images specified, please check the config file.");
        std::process::exit(1);
    }

    let mut final_height = 0u32;
    let mut final_width = 0u32;
    let mut images = vec![];
    println!("Loading images...");
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

    println!("Generating...");
    for img in &images {
        final_img.copy_from(img, 0, y_offset)?;
        y_offset += img.dimensions().1;
    }

    println!("Saving...");
    final_img.save(config.save_to)?;

    Ok(())
}
