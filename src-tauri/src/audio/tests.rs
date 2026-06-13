use crate::commands::WaveId;
use crate::audio::copy::{copy_audio_file, remove_custom_audio_file};
use crate::audio::paths::resolve_audio_path_logic;
use tempfile::tempdir;
use std::fs::File;
use std::io::Write;

#[test]
fn test_copy_audio_file_success_and_remove() {
    let source_dir = tempdir().unwrap();
    let app_data_dir = tempdir().unwrap();

    let source_path = source_dir.path().join("test_song.mp3");
    {
        let mut file = File::create(&source_path).unwrap();
        file.write_all(b"fake mp3 content").unwrap();
    }

    // Probar copia exitosa
    let res = copy_audio_file(
        source_path.to_str().unwrap(),
        &WaveId::Beta,
        app_data_dir.path()
    );
    assert!(res.is_ok());
    assert_eq!(res.unwrap(), "test_song.mp3");

    // Verificar que el archivo existe en custom
    let custom_file = app_data_dir.path().join("custom").join("beta").join("test_song.mp3");
    assert!(custom_file.exists());

    // Probar resolución
    let resource_dir = tempdir().unwrap();
    let (source, resolved_path, display_name) = resolve_audio_path_logic(
        &WaveId::Beta,
        Some("test_song.mp3"),
        app_data_dir.path(),
        resource_dir.path()
    );
    assert_eq!(source, "custom");
    assert_eq!(display_name, "test_song.mp3");
    assert!(resolved_path.is_some());

    // Probar restauración (remove)
    let remove_res = remove_custom_audio_file(&WaveId::Beta, app_data_dir.path());
    assert!(remove_res.is_ok());
    assert!(!custom_file.exists());
}

#[test]
fn test_resolve_prioritizes_custom_over_downloaded_default() {
    // Regresión: el audio personalizado debe tener prioridad sobre el predeterminado
    // descargado (US2). Antes el downloaded-default tapaba siempre al custom.
    let app_data_dir = tempdir().unwrap();
    let resource_dir = tempdir().unwrap();

    // Creamos el downloaded-default: defaults/beta.mp3 (con contenido > 0 bytes)
    let defaults_dir = app_data_dir.path().join("defaults");
    std::fs::create_dir_all(&defaults_dir).unwrap();
    {
        let mut f = File::create(defaults_dir.join("beta.mp3")).unwrap();
        f.write_all(b"downloaded default").unwrap();
    }

    // Creamos el custom: custom/beta/mi_audio.mp3
    let custom_dir = app_data_dir.path().join("custom").join("beta");
    std::fs::create_dir_all(&custom_dir).unwrap();
    {
        let mut f = File::create(custom_dir.join("mi_audio.mp3")).unwrap();
        f.write_all(b"custom audio").unwrap();
    }

    let (source, resolved_path, display_name) = resolve_audio_path_logic(
        &WaveId::Beta,
        Some("mi_audio.mp3"),
        app_data_dir.path(),
        resource_dir.path(),
    );

    assert_eq!(source, "custom", "el custom debe ganar al downloaded-default");
    assert_eq!(display_name, "mi_audio.mp3");
    assert!(resolved_path.unwrap().contains("custom"));
}

#[test]
fn test_resolve_falls_back_to_downloaded_default_without_custom() {
    let app_data_dir = tempdir().unwrap();
    let resource_dir = tempdir().unwrap();

    let defaults_dir = app_data_dir.path().join("defaults");
    std::fs::create_dir_all(&defaults_dir).unwrap();
    {
        let mut f = File::create(defaults_dir.join("gamma.mp3")).unwrap();
        f.write_all(b"downloaded default").unwrap();
    }

    let (source, _path, _name) = resolve_audio_path_logic(
        &WaveId::Gamma,
        None,
        app_data_dir.path(),
        resource_dir.path(),
    );
    assert_eq!(source, "downloaded-default");
}

#[test]
fn test_resolve_unavailable_when_nothing_present() {
    let app_data_dir = tempdir().unwrap();
    let resource_dir = tempdir().unwrap();

    let (source, path, _name) = resolve_audio_path_logic(
        &WaveId::Alfa,
        None,
        app_data_dir.path(),
        resource_dir.path(),
    );
    assert_eq!(source, "unavailable");
    assert!(path.is_none());
}

#[test]
fn test_check_audio_files_reports_missing() {
    use crate::download::downloader::check_audio_files_logic;
    let app_data_dir = tempdir().unwrap();

    // Sin directorio defaults → faltan las 5
    let missing = check_audio_files_logic(app_data_dir.path());
    assert_eq!(missing.len(), 5);

    // Creamos un default válido → debe faltar 4
    let defaults_dir = app_data_dir.path().join("defaults");
    std::fs::create_dir_all(&defaults_dir).unwrap();
    {
        let mut f = File::create(defaults_dir.join("beta.mp3")).unwrap();
        f.write_all(b"x").unwrap();
    }
    // Un fichero vacío (0 bytes) cuenta como ausente
    File::create(defaults_dir.join("gamma.mp3")).unwrap();

    let missing = check_audio_files_logic(app_data_dir.path());
    assert!(!missing.contains(&"beta".to_string()), "beta presente no debe faltar");
    assert!(missing.contains(&"gamma".to_string()), "gamma vacío debe contar como ausente");
    assert_eq!(missing.len(), 4);
}

#[test]
fn test_copy_audio_file_invalid_extension() {
    let source_dir = tempdir().unwrap();
    let app_data_dir = tempdir().unwrap();

    let source_path = source_dir.path().join("test_song.exe");
    {
        let mut file = File::create(&source_path).unwrap();
        file.write_all(b"fake executable").unwrap();
    }

    let res = copy_audio_file(
        source_path.to_str().unwrap(),
        &WaveId::Beta,
        app_data_dir.path()
    );
    assert!(res.is_err());
    assert!(res.unwrap_err().contains("VALIDATION_FAILED"));
}
