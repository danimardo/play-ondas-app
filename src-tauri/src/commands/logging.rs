use crate::logging::bridge::log_client_event;

#[tauri::command]
pub fn emit_log_event(
    level: String,
    event: String,
    context: Option<serde_json::Value>,
    operation_id: Option<String>,
) {
    let is_dev = cfg!(debug_assertions);
    let ctx = context.unwrap_or(serde_json::Value::Null);
    log_client_event(is_dev, &level, &event, ctx, operation_id.as_deref());
}
