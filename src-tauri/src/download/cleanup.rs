use std::fs;
use std::path::Path;

/// Borra los ficheros parciales (`*.tmp`) del directorio de descargas (FR-070).
///
/// Se invoca al cancelar una descarga y al salir de la aplicación (`RunEvent::Exit`),
/// de modo que ningún estado de descarga parcial sobreviva entre sesiones. Los ficheros
/// `{waveId}.mp3` ya completados no se tocan; en el siguiente arranque, la detección de
/// audios faltantes (FR-062) volverá a ejecutarse para lo que siga ausente.
pub fn cleanup_partial_downloads(app_data_dir: &Path) {
    let defaults_dir = app_data_dir.join("defaults");
    if !defaults_dir.exists() {
        return;
    }

    if let Ok(entries) = fs::read_dir(&defaults_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("tmp") {
                let _ = fs::remove_file(&path);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};

    #[test]
    fn test_cleanup_removes_only_tmp_files() {
        let dir = std::env::temp_dir().join(format!("play-ondas-cleanup-{}", std::process::id()));
        let defaults = dir.join("defaults");
        fs::create_dir_all(&defaults).unwrap();

        File::create(defaults.join("gamma.tmp")).unwrap();
        File::create(defaults.join("beta.mp3")).unwrap();

        cleanup_partial_downloads(&dir);

        assert!(!defaults.join("gamma.tmp").exists(), "el .tmp debe borrarse");
        assert!(defaults.join("beta.mp3").exists(), "el .mp3 completo debe conservarse");

        let _ = fs::remove_dir_all(&dir);
    }
}
