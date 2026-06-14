use tauri::Emitter;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[derive(serde::Deserialize)]
pub struct ShortcutsConfig {
    pub toggle: String,
    pub pause: String,
    pub stop: String,
}

#[derive(serde::Serialize)]
pub struct ShortcutsStatus {
    pub toggle: bool,
    pub pause: bool,
    pub stop: bool,
}

/// Desregistra todos los atajos actuales y registra los nuevos.
/// Devuelve el estado de cada atajo (true = registrado con éxito, false = conflicto con otra app).
#[tauri::command]
pub fn apply_shortcuts(app: tauri::AppHandle, shortcuts: ShortcutsConfig) -> ShortcutsStatus {
    let gs = app.global_shortcut();
    let _ = gs.unregister_all();

    let mut status = ShortcutsStatus { toggle: false, pause: false, stop: false };

    match gs.on_shortcut(shortcuts.toggle.as_str(), |app, _, event| {
        if event.state == ShortcutState::Pressed {
            let _ = app.emit("global-shortcut", "toggle");
        }
    }) {
        Ok(_) => status.toggle = true,
        Err(e) => tracing::warn!("Atajo toggle '{}' no disponible: {e}", shortcuts.toggle),
    }

    match gs.on_shortcut(shortcuts.pause.as_str(), |app, _, event| {
        if event.state == ShortcutState::Pressed {
            let _ = app.emit("global-shortcut", "pause");
        }
    }) {
        Ok(_) => status.pause = true,
        Err(e) => tracing::warn!("Atajo pause '{}' no disponible: {e}", shortcuts.pause),
    }

    match gs.on_shortcut(shortcuts.stop.as_str(), |app, _, event| {
        if event.state == ShortcutState::Pressed {
            let _ = app.emit("global-shortcut", "stop");
        }
    }) {
        Ok(_) => status.stop = true,
        Err(e) => tracing::warn!("Atajo stop '{}' no disponible: {e}", shortcuts.stop),
    }

    status
}

/// Consulta qué atajos tiene registrados esta app actualmente (sin modificarlos).
#[tauri::command]
pub fn get_shortcut_status(app: tauri::AppHandle, shortcuts: ShortcutsConfig) -> ShortcutsStatus {
    let gs = app.global_shortcut();
    ShortcutsStatus {
        toggle: gs.is_registered(shortcuts.toggle.as_str()),
        pause: gs.is_registered(shortcuts.pause.as_str()),
        stop: gs.is_registered(shortcuts.stop.as_str()),
    }
}
