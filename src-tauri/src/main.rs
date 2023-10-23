#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod utils;

use tauri::{async_runtime, Manager};
use utils::{generate, Config};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            let main_window_clone = main_window.clone();
            main_window.listen("fe-subcat-generate", move |event| {
                println!("got fe-subcat-generate with payload {:?}", event.payload());
                let config: Config = serde_json::from_str(event.payload().unwrap()).unwrap();

                let main_window = main_window_clone.clone();
                async_runtime::spawn(async move {
                    match generate(config).await {
                        Ok(()) => {
                            main_window.emit("be-subcat-generate", "ok").unwrap();
                            println!("Ok");
                        }
                        Err(err) => {
                            main_window.emit("be-subcat-generate", "error").unwrap();
                            println!("Error {:?}", err);
                        }
                    }
                });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
