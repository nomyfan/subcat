use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct ImageInfo {
    pub(crate) path: String,
    #[serde(alias = "offsetY")]
    pub(crate) offset_y: u32,
    #[serde(alias = "offsetX")]
    pub(crate) offset_x: Option<u32>,
    pub(crate) width: u32,
    pub(crate) height: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) enum PngCompressType {
    Fast,
    Best,
}

/// @see https://serde.rs/json.html
#[derive(Serialize, Deserialize, Debug)]
pub(crate) enum Format {
    #[serde(alias = "PNG")]
    Png(PngCompressType),
    // From 1 to 100
    #[serde(alias = "JPG")]
    Jpg(u8),
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct GenerateEventArgs {
    pub(crate) imgs: Vec<ImageInfo>,
    pub(crate) dir: String,
    pub(crate) filename: String,
    pub(crate) format: Format,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct MenuDisableEventArgs {
    pub(crate) id: String,
    pub(crate) disabled: bool,
}
