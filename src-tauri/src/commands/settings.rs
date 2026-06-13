use crate::config::load::load_settings_file;
use crate::config::persist::persist_settings_file;
use tauri::Manager;
use tracing::{debug, error, warn};

#[tauri::command]
pub fn load_settings(app: tauri::AppHandle, operation_id: String) -> serde_json::Value {
    debug!(event = "config.load.started", operationId = %operation_id);

    let app_dir = match app.path().app_data_dir() {
        Ok(dir) => dir.join("play-ondas-app"),
        Err(e) => {
            error!(event = "config.load.failed", operationId = %operation_id, errorCode = "APP_DIR_ERROR", errorMessage = %e);
            return serde_json::json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "PERMISSION_DENIED",
                    "message": "No se pudo resolver el directorio de datos de la aplicación."
                },
                "defaults": {}
            });
        }
    };

    let settings_path = app_dir.join("settings.json");
    let result = load_settings_file(&settings_path);

    if result["ok"].as_bool() == Some(true) {
        debug!(
            event = "config.load.completed",
            operationId = %operation_id,
            schemaVersion = "1.0.0"
        );
    } else {
        let error_code = result["error"]["code"].as_str().unwrap_or("UNKNOWN_ERROR");
        warn!(
            event = "config.load.failed",
            operationId = %operation_id,
            errorCode = error_code,
            hasDiagnosticCopy = true
        );
    }

    result
}

#[tauri::command]
pub fn persist_settings(
    app: tauri::AppHandle,
    operation_id: String,
    settings: serde_json::Value,
) -> serde_json::Value {
    let start_time = std::time::Instant::now();
    debug!(event = "settings.persist.started", operationId = %operation_id);

    let app_dir = match app.path().app_data_dir() {
        Ok(dir) => dir.join("play-ondas-app"),
        Err(e) => {
            let err_msg = e.to_string();
            error!(event = "settings.persist.failed", operationId = %operation_id, errorCode = "PERMISSION_DENIED", errorMessage = %err_msg);
            return serde_json::json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "PERMISSION_DENIED",
                    "message": "No se pudo resolver el directorio de datos de la aplicación."
                }
            });
        }
    };

    let settings_path = app_dir.join("settings.json");
    let content = match serde_json::to_string_pretty(&settings) {
        Ok(c) => c,
        Err(e) => {
            let err_msg = e.to_string();
            error!(event = "settings.persist.failed", operationId = %operation_id, errorCode = "SERIALIZATION_ERROR", errorMessage = %err_msg);
            return serde_json::json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "CORRUPT_CONFIG",
                    "message": format!("Fallo al serializar configuración: {}", e)
                }
            });
        }
    };

    match persist_settings_file(&settings_path, &content) {
        Ok(_) => {
            let duration = start_time.elapsed().as_millis() as u64;
            debug!(
                event = "settings.persist.completed",
                operationId = %operation_id,
                durationMs = duration
            );
            serde_json::json!({ "ok": true })
        }
        Err(e) => {
            error!(event = "settings.persist.failed", operationId = %operation_id, errorCode = "WRITE_ERROR", errorMessage = %e);
            serde_json::json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "COPY_FAILED",
                    "message": format!("Fallo al escribir configuración: {}", e)
                }
            })
        }
    }
}
