use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager
};
use std::sync::atomic::AtomicBool;
use crate::commands::tray::TrayState;

pub fn build_tray(app: &AppHandle) {
    let show_hide = MenuItem::with_id(app, "show_hide", "Mostrar/Ocultar ventana", true, None::<&str>).unwrap();
    let play = MenuItem::with_id(app, "play", "▶ Reproducir", true, None::<&str>).unwrap();
    let pause = MenuItem::with_id(app, "pause", "⏸ Pausar", true, None::<&str>).unwrap();
    let stop = MenuItem::with_id(app, "stop", "⏹ Detener", true, None::<&str>).unwrap();
    let exit = MenuItem::with_id(app, "exit", "✕ Salir", true, None::<&str>).unwrap();

    let sep1 = tauri::menu::PredefinedMenuItem::separator(app).unwrap();
    let sep2 = tauri::menu::PredefinedMenuItem::separator(app).unwrap();

    let menu = Menu::with_items(
        app,
        &[
            &show_hide,
            &sep1,
            &play,
            &pause,
            &stop,
            &sep2,
            &exit,
        ],
    )
    .unwrap();

    let tray_available = AtomicBool::new(false);

    let tray = TrayIconBuilder::new()
        .tooltip("Play Ondas app")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(move |app_handle: &AppHandle, event| {
            let action = event.id.as_ref().to_string();
            if let Err(e) = crate::commands::tray::tray_action(app_handle.clone(), action) {
                tracing::warn!("Error al procesar acción de la bandeja: {}", e);
            }
        })
        .on_tray_icon_event(move |tray: &tauri::tray::TrayIcon, event: tauri::tray::TrayIconEvent| {
            if let TrayIconEvent::Click { .. } = event {
                let app_handle = tray.app_handle();
                if let Some(main_window) = app_handle.get_webview_window("main") {
                    if main_window.is_visible().unwrap_or(false) {
                        let _ = main_window.hide();
                    } else {
                        let _ = main_window.show();
                        let _ = main_window.set_focus();
                    }
                }
            }
        })
        .build(app);

    match tray {
        Ok(_) => {
            tray_available.store(true, std::sync::atomic::Ordering::Relaxed);
            tracing::info!("Bandeja del sistema inicializada con éxito.");
        }
        Err(e) => {
            tracing::warn!("tray.unavailable: La bandeja del sistema no está disponible en este entorno: {}", e);
        }
    }

    app.manage(TrayState {
        tray_available,
    });
}
