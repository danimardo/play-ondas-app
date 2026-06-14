pub mod downloader;
pub mod cleanup;

use std::sync::atomic::AtomicBool;
use std::sync::Arc;

/// Estado compartido para cancelar una descarga en curso (FR-070).
///
/// El comando `cancel_audio_download` activa el flag; el bucle de descarga lo consulta
/// y aborta limpiando los ficheros temporales.
/// `is_downloading` evita que dos ventanas lancen descargas simultáneas.
pub struct DownloadState {
    pub cancel: Arc<AtomicBool>,
    pub is_downloading: Arc<AtomicBool>,
}

impl Default for DownloadState {
    fn default() -> Self {
        Self {
            cancel: Arc::new(AtomicBool::new(false)),
            is_downloading: Arc::new(AtomicBool::new(false)),
        }
    }
}
