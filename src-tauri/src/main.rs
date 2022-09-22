#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod utils;

use tauri::{async_runtime, Manager};
use utils::{generate, Config};

fn main() {
    tauri::Builder::default()
        .on_page_load(|window, _| {
            let window_ = window.clone();
            window.get_window("main").and_then(|win| {
                Some(win.listen("fe-subcat-generate", move |event| {
                    println!("got fe-subcat-generate with payload {:?}", event.payload());
                    let config: Config = serde_json::from_str(event.payload().unwrap()).unwrap();

                    let window_ = window_.clone();
                    async_runtime::spawn(async move {
                        match generate(config).await {
                            Ok(()) => {
                                window_.emit("be-subcat-generate", "ok").unwrap();
                                println!("Ok");
                            }
                            Err(err) => {
                                window_.emit("be-subcat-generate", "error").unwrap();
                                println!("Error {:?}", err);
                            }
                        }
                    });
                }))
            });
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
