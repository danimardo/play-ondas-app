pub mod layer;
pub mod bridge;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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
