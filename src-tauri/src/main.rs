#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod model;
mod utils;

use crate::model::GenerateEventArgs;
use crate::utils::generate;
use model::MenuDisableEventArgs;
use tauri::{async_runtime, AboutMetadata, CustomMenuItem, Manager, Menu, MenuItem, Submenu};

fn main() {
    // Setup menus
    let mut menu = Menu::new();
    #[cfg(target_os = "macos")]
    {
        menu = menu.add_submenu(Submenu::new(
            "subcat",
            Menu::new().add_native_item(MenuItem::About(
                "subcat".to_string(),
                AboutMetadata::default(),
            )),
        ));
    }
    menu = menu.add_submenu(Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("open".to_string(), "Open").accelerator("CmdOrControl+O"))
            .add_item(
                CustomMenuItem::new("save_as".to_string(), "Save as")
                    .accelerator("CmdOrControl+Shift+S"),
            ),
    ));

    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            let main_window_clone = main_window.clone();
            main_window.listen("fe-subcat-generate", move |event| {
                println!("got fe-subcat-generate with payload {:?}", event.payload());
                let args: GenerateEventArgs =
                    serde_json::from_str(event.payload().unwrap()).unwrap();

                let main_window = main_window_clone.clone();
                async_runtime::spawn(async move {
                    match generate(args).await {
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

            let main_window_clone = main_window.clone();
            main_window.listen("fe-menu-disable", move |event| {
                let menu_handle = main_window_clone.menu_handle();
                let args: MenuDisableEventArgs =
                    serde_json::from_str(event.payload().unwrap()).unwrap();
                menu_handle
                    .get_item(&args.id)
                    .set_enabled(!args.disabled)
                    .unwrap();
            });

            Ok(())
        })
        .menu(menu)
        .on_menu_event(|event| {
            event
                .window()
                .emit("be-menu-select", event.menu_item_id())
                .unwrap();
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
