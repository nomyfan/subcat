use subcat_event::strum::VariantNames;
use subcat_event::SubcatEvent;

fn main() {
    let variants = SubcatEvent::VARIANTS;
    let mut ts_code = String::new();
    ts_code.push_str("export enum SubcatEvent {\n");
    for variant in variants {
        ts_code.push_str(&format!("  {} = \"{}\",\n", variant, variant));
    }
    ts_code.push('}');

    let path = std::path::PathBuf::from("src/index.ts");
    println!("{:?}", std::fs::canonicalize(&path));
    std::fs::write(path, ts_code).unwrap();
}
