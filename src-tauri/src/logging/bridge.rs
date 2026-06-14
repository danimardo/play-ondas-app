use serde_json::json;
use chrono::Utc;
use std::fs::OpenOptions;
use std::io::Write;

pub fn log_client_event(is_dev: bool, level: &str, event: &str, context: serde_json::Value, operation_id: Option<&str>) {
  let utc_now = Utc::now();
  let local_now = utc_now + chrono::Duration::hours(2); // Spain GMT+2
  let local_time_str = local_now.format("%d/%m/%Y %H:%M:%S").to_string();

  let mut context_map = match context {
    serde_json::Value::Object(m) => m,
    _ => serde_json::Map::new(),
  };

  if let Some(op_id) = operation_id {
    context_map.insert("operationId".to_string(), json!(op_id));
  }

  let log_entry = json!({
    "time": utc_now.to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
    "localTime": local_time_str,
    "timezone": "Europe/Madrid",
    "level": level.to_lowercase(),
    "event": event,
    "process": "client",
    "context": context_map
  });

  let serialized = match serde_json::to_string(&log_entry) {
    Ok(s) => s,
    Err(_) => return,
  };

  if is_dev {
    let dir = crate::logging::dev_logs_dir();
    if let Ok(mut file) = OpenOptions::new()
      .create(true)
      .append(true)
      .open(dir.join("app.jsonl"))
    {
      let _ = writeln!(file, "{}", serialized);
    }

    if let Ok(mut file) = OpenOptions::new()
      .create(true)
      .append(true)
      .open(dir.join("app.log"))
    {
      let _ = writeln!(file, "[{}] [{}] [client] {}: {:?}", local_time_str, level, event, log_entry["context"]);
    }
  } else {
    println!("{}", serialized);
  }
}
