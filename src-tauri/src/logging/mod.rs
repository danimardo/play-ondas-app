pub mod layer;
pub mod bridge;

use std::path::PathBuf;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// Directorio de logs en desarrollo: `<raíz del repo>/.logs`.
///
/// Se deriva de `CARGO_MANIFEST_DIR` (= `src-tauri/`) subiendo un nivel, de modo
/// que los ficheros siempre se escriben en la raíz del proyecto (`.logs/app.log`,
/// `.logs/app.jsonl`) independientemente del working directory del proceso, que
/// con `tauri dev`/`cargo run` es `src-tauri/`. En producción se usa stdout.
pub fn dev_logs_dir() -> PathBuf {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or(manifest_dir)
        .join(".logs")
}

pub fn init_logger() {
    let is_dev = cfg!(debug_assertions);
    let layer = layer::JsonLineLoggerLayer::new(is_dev);
    
    // Default level filters based on environment
    let env_filter = if is_dev {
        "debug"
    } else {
        "info"
    };

    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(env_filter));

    let _ = tracing_subscriber::registry()
        .with(filter)
        .with(layer)
        .try_init();
}
