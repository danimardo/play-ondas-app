use std::fs::create_dir_all;
use std::io::Write;
use std::path::Path;
use tempfile::NamedTempFile;

pub fn persist_settings_file(target_path: &Path, content: &str) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = target_path.parent() {
        create_dir_all(parent).map_err(|e| format!("Failed to create directories: {}", e))?;
    }

    let parent_dir = target_path.parent().unwrap_or_else(|| Path::new("."));

    // Create temp file in same directory
    let mut temp_file = NamedTempFile::new_in(parent_dir)
        .map_err(|e| format!("Failed to create temporary settings file: {}", e))?;

    // Write content
    temp_file
        .write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write to temporary settings file: {}", e))?;
    temp_file
        .flush()
        .map_err(|e| format!("Failed to flush temporary settings file: {}", e))?;

    // Rename temp file atomically
    temp_file
        .persist(target_path)
        .map_err(|e| format!("Failed to rename temporary settings file to target: {}", e))?;

    Ok(())
}
