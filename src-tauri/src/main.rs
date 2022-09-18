#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod utils;

use tauri::Manager;
use tokio;
use utils::{generate, Config};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.listen_global("fe-subcat-generate", |event| {
                println!("got fe-subcat-generate with payload {:?}", event.payload());
                let config: Config = serde_json::from_str(event.payload().unwrap()).unwrap();

                let _ = std::thread::spawn(move || {
                    let rt = tokio::runtime::Runtime::new().unwrap();
                    rt.block_on(async {
                        match generate(config).await {
                            Ok(()) => {
                                println!("Ok")
                            }
                            Err(err) => {
                                println!("Error {:?}", err)
                            }
                        }
                    });
                })
                .join();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
