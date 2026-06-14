use std::sync::atomic::Ordering;
use crate::download::downloader::{check_audio_files_logic, download_audio_files};
use crate::download::DownloadState;
use tauri::{AppHandle, Manager, State, WebviewWindow};
use tracing::{info, warn};

#[tauri::command]
pub fn check_audio_files(app: AppHandle) -> Vec<String> {
    // La ruta canónica de almacenamiento es {appDataDir}/play-ondas-app/ (igual que
    // resolve_audio_path y settings, y dentro del scope del asset protocol $APPDATA/play-ondas-app/**).
    let app_data_dir = app.path().app_data_dir().unwrap_or_default().join("play-ondas-app");
    check_audio_files_logic(&app_data_dir)
}

#[tauri::command]
pub async fn start_audio_download(
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, DownloadState>,
) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().unwrap_or_default().join("play-ondas-app");
    let missing_waves = check_audio_files_logic(&app_data_dir);

    if missing_waves.is_empty() {
        return Ok(());
    }

    // Reiniciamos el flag de cancelación al comenzar una nueva descarga.
    let cancel = state.cancel.clone();
    cancel.store(false, Ordering::Relaxed);

    info!(event = "audio.download.started", missingCount = missing_waves.len());

    let result = download_audio_files(app, window, missing_waves, app_data_dir, cancel).await;

    match &result {
        Ok(_) => info!(event = "audio.download.completed"),
        Err(e) => warn!(event = "audio.download.failed", errorMessage = %e),
    }

    result
}

#[tauri::command]
pub fn cancel_audio_download(state: State<'_, DownloadState>) {
    state.cancel.store(true, Ordering::Relaxed);
    info!(event = "audio.download.cancelled");
}
