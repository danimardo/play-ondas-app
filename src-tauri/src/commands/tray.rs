use tauri::{AppHandle, Manager, Emitter};
use std::sync::atomic::{AtomicBool, Ordering};

pub struct TrayState {
    pub tray_available: AtomicBool,
}

#[tauri::command]
pub fn resolve_tray_available(state: tauri::State<'_, TrayState>) -> bool {
    state.tray_available.load(Ordering::Relaxed)
}

#[tauri::command]
pub fn tray_action(app: AppHandle, action: String) -> Result<(), String> {
    let main_window = app.get_webview_window("main")
        .ok_or_else(|| "Ventana principal no encontrada".to_string())?;

    match action.as_str() {
        "show_hide" => {
            if main_window.is_visible().unwrap_or(false) {
                let _ = main_window.hide();
            } else {
                let _ = main_window.show();
                let _ = main_window.set_focus();
            }
        }
        "play" => {
            let _ = app.emit("tray:action", "play");
        }
        "pause" => {
            let _ = app.emit("tray:action", "pause");
        }
        "stop" => {
            let _ = app.emit("tray:action", "stop");
        }
        "exit" => {
            app.exit(0);
        }
        _ => return Err(format!("Acción de bandeja desconocida: {}", action)),
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_tray_available() {
        let state_true = TrayState {
            tray_available: AtomicBool::new(true),
        };
        assert!(state_true.tray_available.load(Ordering::Relaxed));

        let state_false = TrayState {
            tray_available: AtomicBool::new(false),
        };
        assert!(!state_false.tray_available.load(Ordering::Relaxed));
    }
}
