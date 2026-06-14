use std::path::Path;
use crate::commands::WaveId;

pub fn resolve_audio_path_logic(
    wave_id: &WaveId,
    custom_file_name: Option<&str>,
    app_data_dir: &Path,
    resource_dir: &Path,
) -> (String, Option<String>, String) {
    let wave_str = match wave_id {
        WaveId::Gamma => "gamma",
        WaveId::Beta => "beta",
        WaveId::Alfa => "alfa",
        WaveId::Theta => "theta",
        WaveId::Delta => "delta",
        WaveId::BrownNoise => "brown-noise",
        WaveId::WhiteNoise => "white-noise",
        WaveId::PinkNoise => "pink-noise",
        WaveId::GreenNoise => "green-noise",
        WaveId::Fireplace => "fireplace",
    };

    // 1. Check custom audio copy: {appDataDir}/play-ondas-app/custom/{waveId}/{custom_file_name}
    //    El audio personalizado tiene prioridad sobre el predeterminado descargado: si el usuario
    //    asoció un fichero propio (US2), debe reproducirse aunque exista el default (que siempre
    //    existe tras la descarga inicial). Ver nota de desviación en data-model.md / plan.md.
    if let Some(file_name) = custom_file_name {
        if !file_name.is_empty() {
            let custom_path = app_data_dir.join("custom").join(wave_str).join(file_name);
            if custom_path.exists() && custom_path.is_file() {
                return (
                    "custom".to_string(),
                    Some(custom_path.to_string_lossy().to_string()),
                    file_name.to_string(),
                );
            }
        }
    }

    // 2. Check downloaded default: {appDataDir}/play-ondas-app/defaults/{waveId}.mp3
    let downloaded_path = app_data_dir.join("defaults").join(format!("{}.mp3", wave_str));
    if downloaded_path.exists() && downloaded_path.is_file() {
        if let Ok(metadata) = std::fs::metadata(&downloaded_path) {
            if metadata.len() > 0 {
                return (
                    "downloaded-default".to_string(),
                    Some(downloaded_path.to_string_lossy().to_string()),
                    format!("{}.mp3", wave_str),
                );
            }
        }
    }

    // 3. Check bundled OGG fallback: {resource_dir}/audio/{waveId}.ogg
    let bundled_path = resource_dir.join("audio").join(format!("{}.ogg", wave_str));
    if bundled_path.exists() && bundled_path.is_file() {
        return (
            "bundled-default".to_string(),
            Some(bundled_path.to_string_lossy().to_string()),
            format!("{}.ogg", wave_str),
        );
    }

    // 4. Unavailable
    (
        "unavailable".to_string(),
        None,
        "Audio no disponible".to_string(),
    )
}
