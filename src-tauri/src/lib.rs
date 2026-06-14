pub mod commands;
pub mod config;
pub mod logging;
pub mod audio;
pub mod download;
pub mod tray;

use commands::logging::emit_log_event;
use commands::settings::{load_settings, persist_settings};
use commands::audio::{resolve_audio_path, replace_wave_audio, restore_wave_audio};
use commands::download::{check_audio_files, start_audio_download, cancel_audio_download};
use commands::tray::{resolve_tray_available, tray_action};
use download::DownloadState;
use download::cleanup::cleanup_partial_downloads;
use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging subscriber
    logging::init_logger();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+shift+p", "ctrl+shift+x", "ctrl+shift+s"])
                .expect("Error al registrar atajos globales")
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let action = if shortcut.matches(Modifiers::CONTROL | Modifiers::SHIFT, Code::KeyP) {
                            Some("toggle")
                        } else if shortcut.matches(Modifiers::CONTROL | Modifiers::SHIFT, Code::KeyX) {
                            Some("pause")
                        } else if shortcut.matches(Modifiers::CONTROL | Modifiers::SHIFT, Code::KeyS) {
                            Some("stop")
                        } else {
                            None
                        };
                        if let Some(action) = action {
                            let _ = app.emit("global-shortcut", action);
                        }
                    }
                })
                .build(),
        )
        .manage(DownloadState::default())
        .setup(|app| {
            // Inicializar bandeja
            tray::setup::build_tray(app.handle());

            // Escuchar el evento de solicitud de cierre de la ventana
            if let Some(main_window) = app.get_webview_window("main") {
                let app_handle = app.handle().clone();

                main_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        // Impedimos el cierre inmediato por defecto y enviamos un evento al frontend
                        api.prevent_close();
                        let _ = app_handle.emit("window:close-requested", ());
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            emit_log_event,
            load_settings,
            persist_settings,
            resolve_audio_path,
            check_audio_files,
            start_audio_download,
            cancel_audio_download,
            replace_wave_audio,
            restore_wave_audio,
            resolve_tray_available,
            tray_action
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    // Al salir, descartamos cualquier descarga parcial (FR-070).
    app.run(|app_handle, event| {
        if let RunEvent::Exit = event {
            if let Ok(dir) = app_handle.path().app_data_dir() {
                cleanup_partial_downloads(&dir.join("play-ondas-app"));
            }
        }
    });
}
