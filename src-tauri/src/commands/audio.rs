use crate::audio::paths::resolve_audio_path_logic;
use crate::audio::copy::{copy_audio_file, remove_custom_audio_file};
use crate::commands::WaveId;
use tauri::Manager;

#[tauri::command]
pub fn resolve_audio_path(
    app: tauri::AppHandle,
    wave_id: WaveId,
    custom_file_name: Option<String>,
) -> serde_json::Value {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_default()
        .join("play-ondas-app");
    let resource_dir = app
        .path()
        .resource_dir()
        .unwrap_or_default();

    let (source, resolved_path, display_name) =
        resolve_audio_path_logic(&wave_id, custom_file_name.as_deref(), &app_data_dir, &resource_dir);

    serde_json::json!({
        "waveId": wave_id,
        "source": source,
        "resolvedPath": resolved_path,
        "displayName": display_name
    })
}

#[tauri::command]
pub async fn replace_wave_audio(
    app: tauri::AppHandle,
    _operation_id: String,
    wave_id: WaveId,
    source_path: String,
) -> serde_json::Value {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_default()
        .join("play-ondas-app");

    match copy_audio_file(&source_path, &wave_id, &app_data_dir) {
        Ok(display_name) => {
            serde_json::json!({
                "ok": true,
                "displayName": display_name
            })
        }
        Err(e) => {
            let (code, message) = if e.contains(":") {
                let parts: Vec<&str> = e.splitn(2, ':').collect();
                (parts[0].trim().to_string(), parts[1].trim().to_string())
            } else {
                ("WRITE_ERROR".to_string(), e)
            };

            serde_json::json!({
                "ok": false,
                "error": {
                    "code": code,
                    "message": message
                }
            })
        }
    }
}

#[tauri::command]
pub async fn restore_wave_audio(
    app: tauri::AppHandle,
    _operation_id: String,
    wave_id: WaveId,
) -> serde_json::Value {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_default()
        .join("play-ondas-app");

    match remove_custom_audio_file(&wave_id, &app_data_dir) {
        Ok(_) => {
            serde_json::json!({
                "ok": true
            })
        }
        Err(e) => {
            serde_json::json!({
                "ok": false,
                "error": {
                    "code": "WRITE_ERROR",
                    "message": e
                }
            })
        }
    }
}
