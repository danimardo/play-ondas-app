pub mod load;
pub mod persist;

#[cfg(test)]
mod tests {
    use super::load::load_settings_file;
    use super::persist::persist_settings_file;
    use tempfile::tempdir;

    #[test]
    fn test_load_returns_defaults_when_missing() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("settings.json");
        let result = load_settings_file(&path);
        assert_eq!(result["ok"].as_bool(), Some(true));
        assert_eq!(result["settings"]["volume"].as_i64(), Some(70));
        assert_eq!(result["settings"]["schemaVersion"].as_str(), Some("1.0.0"));
    }

    #[test]
    fn test_persist_then_load_roundtrip() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("settings.json");

        let content = r#"{"schemaVersion":"1.0.0","selectedWave":"alfa","volume":42,"theme":"dark","loop":true,"minimizeToTrayOnClose":false,"startMinimized":false,"closeDialogSeen":true,"customAudio":{"gamma":null,"beta":null,"alfa":null,"theta-delta":null,"brown-noise":null}}"#;
        persist_settings_file(&path, content).unwrap();
        assert!(path.exists());

        let result = load_settings_file(&path);
        assert_eq!(result["ok"].as_bool(), Some(true));
        assert_eq!(result["settings"]["selectedWave"].as_str(), Some("alfa"));
        assert_eq!(result["settings"]["volume"].as_i64(), Some(42));
    }

    #[test]
    fn test_corrupt_config_backs_up_and_resets() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("settings.json");
        std::fs::write(&path, "{ esto no es json válido ").unwrap();

        let result = load_settings_file(&path);
        assert_eq!(result["ok"].as_bool(), Some(false));
        assert_eq!(result["error"]["code"].as_str(), Some("CORRUPT_CONFIG"));
        // Debe devolver defaults y haber creado una copia settings.corrupt-*.json
        assert_eq!(result["defaults"]["volume"].as_i64(), Some(70));
        let has_backup = std::fs::read_dir(dir.path())
            .unwrap()
            .flatten()
            .any(|e| e.file_name().to_string_lossy().starts_with("settings.corrupt-"));
        assert!(has_backup, "debe existir una copia de diagnóstico");
    }

    #[test]
    fn test_schema_version_mismatch_resets() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("settings.json");
        std::fs::write(&path, r#"{"schemaVersion":"0.9.0","volume":10}"#).unwrap();

        let result = load_settings_file(&path);
        assert_eq!(result["ok"].as_bool(), Some(false));
        assert_eq!(result["error"]["code"].as_str(), Some("SCHEMA_VERSION_MISMATCH"));
    }
}
