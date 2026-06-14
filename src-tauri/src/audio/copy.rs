use std::fs::{create_dir_all, remove_dir_all, File};
use std::path::Path;
use crate::commands::WaveId;

pub fn copy_audio_file(
    source_path: &str,
    wave_id: &WaveId,
    app_data_dir: &Path,
) -> Result<String, String> {
    let source = Path::new(source_path);
    if !source.exists() || !source.is_file() {
        return Err("DOWNLOAD_FAILED_HTTP_4XX: El archivo de origen no existe o no es válido.".to_string());
    }

    // Validamos la extensión del archivo
    let extension = source
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase());

    let allowed_extensions = vec!["mp3", "wav", "ogg", "flac", "m4a"];
    match extension {
        Some(ext) if allowed_extensions.contains(&ext.as_str()) => {}
        _ => return Err("VALIDATION_FAILED: Formato de archivo no soportado. Formatos admitidos: mp3, wav, ogg, flac, m4a.".to_string()),
    }

    let file_name = source
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "VALIDATION_FAILED: Nombre de archivo inválido.".to_string())?;

    let wave_str = match wave_id {
        WaveId::Gamma => "gamma",
        WaveId::Beta => "beta",
        WaveId::Alfa => "alfa",
        WaveId::ThetaDelta => "theta-delta",
        WaveId::BrownNoise => "brown-noise",
    };

    // Carpeta de destino: {appDataDir}/custom/{waveId}/
    let dest_dir = app_data_dir.join("custom").join(wave_str);

    // Borramos cualquier custom audio anterior para esta onda
    if dest_dir.exists() {
        let _ = remove_dir_all(&dest_dir);
    }
    
    if let Err(e) = create_dir_all(&dest_dir) {
        return Err(format!("WRITE_ERROR: No se pudo crear el directorio de destino: {}", e));
    }

    let dest_path = dest_dir.join(file_name);

    let mut src_file = File::open(source)
        .map_err(|e| format!("READ_ERROR: No se pudo abrir el archivo de origen: {}", e))?;
    
    let mut dest_file = File::create(&dest_path)
        .map_err(|e| format!("WRITE_ERROR: No se pudo crear el archivo de destino: {}", e))?;

    std::io::copy(&mut src_file, &mut dest_file)
        .map_err(|e| format!("WRITE_ERROR: Error al copiar el archivo: {}", e))?;

    Ok(file_name.to_string())
}

pub fn remove_custom_audio_file(
    wave_id: &WaveId,
    app_data_dir: &Path,
) -> Result<(), String> {
    let wave_str = match wave_id {
        WaveId::Gamma => "gamma",
        WaveId::Beta => "beta",
        WaveId::Alfa => "alfa",
        WaveId::ThetaDelta => "theta-delta",
        WaveId::BrownNoise => "brown-noise",
    };

    let dest_dir = app_data_dir.join("custom").join(wave_str);
    if dest_dir.exists() {
        remove_dir_all(&dest_dir)
            .map_err(|e| format!("WRITE_ERROR: No se pudo borrar el audio personalizado: {}", e))?;
    }

    Ok(())
}
