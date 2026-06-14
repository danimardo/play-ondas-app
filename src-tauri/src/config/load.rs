use std::fs::{read_to_string, rename};
use std::path::Path;
use chrono::Utc;
use serde_json::json;

pub fn load_settings_file(target_path: &Path) -> serde_json::Value {
    let defaults = json!({
        "schemaVersion": "1.0.0",
        "selectedWave": "gamma",
        "volume": 70,
        "theme": "auto",
        "loop": true,
        "minimizeToTrayOnClose": true,
        "startMinimized": false,
        "closeDialogSeen": false,
        "customAudio": {
            "gamma": null,
            "beta": null,
            "alfa": null,
            "theta": null,
            "delta": null,
            "brown-noise": null,
            "white-noise": null,
            "pink-noise": null,
            "green-noise": null,
            "fireplace": null
        }
    });

    if !target_path.exists() {
        return json!({
            "ok": true,
            "settings": defaults
        });
    }

    let file_content = match read_to_string(target_path) {
        Ok(content) => content,
        Err(e) => {
            return json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "PERMISSION_DENIED",
                    "message": format!("No se pudo leer la configuración: {}", e)
                },
                "defaults": defaults
            });
        }
    };

    let parsed_json: serde_json::Value = match serde_json::from_str(&file_content) {
        Ok(json) => json,
        Err(_) => {
            // Backup corrupt file and reset
            let timestamp = Utc::now().format("%Y%m%d-%H%M%S").to_string();
            let parent = target_path.parent().unwrap_or_else(|| Path::new("."));
            let corrupt_path = parent.join(format!("settings.corrupt-{}.json", timestamp));
            
            let _ = rename(target_path, &corrupt_path);
            
            return json!({
                "ok": false,
                "error": {
                    "field": "settings",
                    "code": "CORRUPT_CONFIG",
                    "message": "El archivo de configuración estaba corrupto. Se ha restaurado la configuración por defecto y creado una copia de diagnóstico."
                },
                "defaults": defaults
            });
        }
    };

    // Validate schemaVersion
    let schema_version = parsed_json.get("schemaVersion").and_then(|v| v.as_str());
    if schema_version != Some("1.0.0") {
        let timestamp = Utc::now().format("%Y%m%d-%H%M%S").to_string();
        let parent = target_path.parent().unwrap_or_else(|| Path::new("."));
        let corrupt_path = parent.join(format!("settings.corrupt-{}.json", timestamp));
        
        let _ = rename(target_path, &corrupt_path);

        return json!({
            "ok": false,
            "error": {
                "field": "settings",
                "code": "SCHEMA_VERSION_MISMATCH",
                "message": "La versión del esquema de configuración no coincide. Se ha restaurado la configuración por defecto."
            },
            "defaults": defaults
        });
    }

    json!({
        "ok": true,
        "settings": parsed_json
    })
}
