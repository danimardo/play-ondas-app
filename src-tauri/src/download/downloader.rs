use std::collections::HashMap;
use std::fs::{create_dir_all, remove_file, rename, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use futures_util::StreamExt;
use reqwest::Client;
use tauri::{AppHandle, WebviewWindow, Emitter};

#[derive(serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileProgress {
    pub wave_id: String,
    pub progress_percent: u8,
    pub bytes_downloaded: u64,
    pub total_bytes: u64,
    pub status: String, // "pending" | "downloading" | "completed" | "failed"
}

#[derive(serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GlobalProgress {
    pub current_file_index: usize,
    pub total_files: usize,
    pub total_bytes_downloaded: u64,
    pub total_bytes_estimated: u64,
    pub global_progress_percent: u8,
    pub status: String, // "idle" | "checking" | "downloading" | "completed" | "failed"
    pub error: Option<String>,
    pub files: HashMap<String, FileProgress>,
}

pub fn check_audio_files_logic(app_data_dir: &Path) -> Vec<String> {
    let waves = vec!["gamma", "beta", "alfa", "theta-delta", "brown-noise"];
    let mut missing_waves = Vec::new();

    let defaults_dir = app_data_dir.join("defaults");
    if !defaults_dir.exists() {
        return waves.into_iter().map(String::from).collect();
    }

    for wave in waves {
        let file_path = defaults_dir.join(format!("{}.mp3", wave));
        if !file_path.exists() || !file_path.is_file() {
            missing_waves.push(wave.to_string());
            continue;
        }

        if let Ok(metadata) = std::fs::metadata(&file_path) {
            if metadata.len() == 0 {
                missing_waves.push(wave.to_string());
            }
        } else {
            missing_waves.push(wave.to_string());
        }
    }

    missing_waves
}

pub async fn download_audio_files(
    _app: AppHandle,
    window: WebviewWindow,
    missing_waves: Vec<String>,
    app_data_dir: PathBuf,
    cancel: Arc<AtomicBool>,
) -> Result<(), String> {
    let defaults_dir = app_data_dir.join("defaults");
    if let Err(e) = create_dir_all(&defaults_dir) {
        return Err(format!("No se pudo crear el directorio de audios por defecto: {}", e));
    }

    let client = Client::builder()
        .use_rustls_tls()
        .build()
        .map_err(|e| format!("Error al inicializar cliente HTTP: {}", e))?;

    let total_files = missing_waves.len();
    let mut files_progress = HashMap::new();

    // Inicializamos el progreso de todos los archivos faltantes
    for wave in &missing_waves {
        files_progress.insert(
            wave.clone(),
            FileProgress {
                wave_id: wave.clone(),
                progress_percent: 0,
                bytes_downloaded: 0,
                total_bytes: 0,
                status: "pending".to_string(),
            },
        );
    }

    let mut global_progress = GlobalProgress {
        current_file_index: 0,
        total_files,
        total_bytes_downloaded: 0,
        total_bytes_estimated: 0,
        global_progress_percent: 0,
        status: "downloading".to_string(),
        error: None,
        files: files_progress,
    };

    // Emitimos progreso inicial
    let _ = window.emit("download-progress", global_progress.clone());

    for (index, wave_id) in missing_waves.iter().enumerate() {
        // Cancelación solicitada (p. ej. cierre de la app): abortamos antes de empezar el fichero.
        if cancel.load(Ordering::Relaxed) {
            return Err("CANCELLED: Descarga cancelada por el usuario.".to_string());
        }

        global_progress.current_file_index = index;

        let url = format!("https://files.mardomingo.com/audios/{}.mp3", wave_id);
        
        // Actualizamos estado de archivo actual a downloading
        if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
            file_prog.status = "downloading".to_string();
        }
        let _ = window.emit("download-progress", global_progress.clone());

        let res = match client.get(&url).send().await {
            Ok(response) => {
                let status = response.status();
                if !status.is_success() {
                    let err_code = if status.is_client_error() {
                        "DOWNLOAD_FAILED_HTTP_4XX"
                    } else {
                        "DOWNLOAD_FAILED_HTTP_5XX"
                    };
                    let err_msg = format!("Servidor devolvió estado HTTP {}", status.as_u16());
                    
                    if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                        file_prog.status = "failed".to_string();
                    }
                    global_progress.status = "failed".to_string();
                    global_progress.error = Some(err_msg.clone());
                    let _ = window.emit("download-progress", global_progress.clone());
                    
                    return Err(format!("{}: {}", err_code, err_msg));
                }
                response
            }
            Err(e) => {
                if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                    file_prog.status = "failed".to_string();
                }
                global_progress.status = "failed".to_string();
                global_progress.error = Some(e.to_string());
                let _ = window.emit("download-progress", global_progress.clone());
                
                return Err(format!("DOWNLOAD_FAILED_NETWORK: {}", e));
            }
        };

        let total_size = res.content_length().unwrap_or(0);
        if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
            file_prog.total_bytes = total_size;
        }
        global_progress.total_bytes_estimated += total_size;

        let temp_file_path = defaults_dir.join(format!("{}.tmp", wave_id));
        let mut file = match File::create(&temp_file_path) {
            Ok(f) => f,
            Err(e) => {
                if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                    file_prog.status = "failed".to_string();
                }
                global_progress.status = "failed".to_string();
                global_progress.error = Some(e.to_string());
                let _ = window.emit("download-progress", global_progress.clone());
                return Err(format!("WRITE_ERROR: No se pudo crear archivo temporal: {}", e));
            }
        };

        let mut stream = res.bytes_stream();
        let mut downloaded_bytes: u64 = 0;
        let mut last_emit_bytes: u64 = 0;

        while let Some(chunk_result) = stream.next().await {
            // Cancelación a mitad de descarga: descartamos el fichero temporal parcial (FR-070).
            if cancel.load(Ordering::Relaxed) {
                drop(file);
                let _ = remove_file(&temp_file_path);
                return Err("CANCELLED: Descarga cancelada por el usuario.".to_string());
            }

            let chunk: bytes::Bytes = match chunk_result {
                Ok(bytes) => bytes,
                Err(e) => {
                    let _ = remove_file(&temp_file_path);
                    if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                        file_prog.status = "failed".to_string();
                    }
                    global_progress.status = "failed".to_string();
                    global_progress.error = Some(e.to_string());
                    let _ = window.emit("download-progress", global_progress.clone());
                    return Err(format!("DOWNLOAD_FAILED_NETWORK: {}", e));
                }
            };

            if let Err(e) = file.write_all(&chunk) {
                let _ = remove_file(&temp_file_path);
                if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                    file_prog.status = "failed".to_string();
                }
                global_progress.status = "failed".to_string();
                global_progress.error = Some(e.to_string());
                let _ = window.emit("download-progress", global_progress.clone());
                return Err(format!("WRITE_ERROR: Error de escritura en disco: {}", e));
            }

            downloaded_bytes += chunk.len() as u64;
            global_progress.total_bytes_downloaded += chunk.len() as u64;

            // Emitir progreso cada 32 KB o al terminar el archivo
            if downloaded_bytes - last_emit_bytes >= 32 * 1024 || (total_size > 0 && downloaded_bytes >= total_size) {
                last_emit_bytes = downloaded_bytes;

                let file_pct = if total_size > 0 {
                    ((downloaded_bytes as f64 / total_size as f64) * 100.0) as u8
                } else {
                    0
                };

                if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                    file_prog.bytes_downloaded = downloaded_bytes;
                    file_prog.progress_percent = file_pct;
                }

                // Progreso global basado en ficheros completados + fracción del fichero actual.
                // Funciona aunque el servidor no devuelva Content-Length.
                let completed = global_progress.files.values()
                    .filter(|f| f.status == "completed")
                    .count() as f64;
                let total = global_progress.total_files as f64;
                let current_fraction = file_pct as f64 / 100.0;
                global_progress.global_progress_percent =
                    ((completed / total + current_fraction / total) * 100.0).min(99.0) as u8;

                let _ = window.emit("download-progress", global_progress.clone());
            }
        }

        // Cerramos archivo
        drop(file);

        // Renombrado atómico del archivo temporal al definitivo
        let final_file_path = defaults_dir.join(format!("{}.mp3", wave_id));
        if let Err(e) = rename(&temp_file_path, &final_file_path) {
            let _ = remove_file(&temp_file_path);
            if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
                file_prog.status = "failed".to_string();
            }
            global_progress.status = "failed".to_string();
            global_progress.error = Some(e.to_string());
            let _ = window.emit("download-progress", global_progress.clone());
            return Err(format!("WRITE_ERROR: Error al renombrar archivo de audio temporal: {}", e));
        }

        // Archivo completado
        if let Some(file_prog) = global_progress.files.get_mut(wave_id) {
            file_prog.status = "completed".to_string();
            file_prog.progress_percent = 100;
            file_prog.bytes_downloaded = total_size;
        }
        let _ = window.emit("download-progress", global_progress.clone());
    }

    // Todos los archivos descargados correctamente
    global_progress.status = "completed".to_string();
    global_progress.global_progress_percent = 100;
    let _ = window.emit("download-progress", global_progress);

    Ok(())
}
