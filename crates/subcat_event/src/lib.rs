use strum::{AsRefStr, EnumVariantNames};

#[derive(AsRefStr, EnumVariantNames)]
#[strum(serialize_all = "PascalCase")]
pub enum SubcatEvent {
    FeMenuDisable,
    BeMenuSelect,
    FeGenerate,
    BeGenerateRes,
}

pub use strum;
