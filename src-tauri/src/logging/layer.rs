use chrono::Utc;
use serde_json::json;
use std::fs::OpenOptions;
use std::io::Write;
use tracing::{Event, Subscriber};
use tracing_subscriber::{layer::Context, Layer};

pub struct JsonLineLoggerLayer {
    is_dev: bool,
}

impl JsonLineLoggerLayer {
    pub fn new(is_dev: bool) -> Self {
        if is_dev {
            // Ensure logs directory exists and truncate the app.jsonl file
            let _ = std::fs::create_dir_all(".logs");
            let _ = std::fs::write(".logs/app.jsonl", "");
            let _ = std::fs::write(".logs/app.log", "");
        }
        Self { is_dev }
    }

    fn write_log(&self, level_str: &str, event_str: &str, process: &str, context: serde_json::Value) {
        let utc_now = Utc::now();
        // Spain time (Europe/Madrid) offset in 2026-06-13 is +2 hours (DST)
        // Let's format manually or use chrono's offset. Since we want Europe/Madrid timezone:
        let local_now = utc_now + chrono::Duration::hours(2);
        let local_time_str = local_now.format("%d/%m/%Y %H:%M:%S").to_string();

        let log_entry = json!({
            "time": utc_now.to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
            "localTime": local_time_str,
            "timezone": "Europe/Madrid",
            "level": level_str,
            "event": event_str,
            "process": process,
            "context": context
        });

        let serialized = match serde_json::to_string(&log_entry) {
            Ok(s) => s,
            Err(_) => return,
        };

        if self.is_dev {
            if let Ok(mut file) = OpenOptions::new()
                .create(true)
                .append(true)
                .open(".logs/app.jsonl")
            {
                let _ = writeln!(file, "{}", serialized);
            }

            // Also write human readable to app.log
            if let Ok(mut file) = OpenOptions::new()
                .create(true)
                .append(true)
                .open(".logs/app.log")
            {
                let _ = writeln!(file, "[{}] [{}] [{}] {}: {:?}", local_time_str, level_str, process, event_str, log_entry["context"]);
            }
        } else {
            println!("{}", serialized);
        }
    }
}

impl<S: Subscriber> Layer<S> for JsonLineLoggerLayer {
    fn on_event(&self, event: &Event<'_>, _ctx: Context<'_, S>) {
        let metadata = event.metadata();
        let level = metadata.level().to_string().to_lowercase();
        
        let mut event_name = metadata.name();
        
        // Find if there is a custom event name in fields
        struct EventNameVisitor {
            name: String,
            context: serde_json::Map<String, serde_json::Value>,
        }

        impl tracing::field::Visit for EventNameVisitor {
            fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
                if field.name() == "event" {
                    self.name = value.to_string();
                } else {
                    self.context.insert(field.name().to_string(), serde_json::Value::String(value.to_string()));
                }
            }

            fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
                if field.name() != "event" {
                    self.context.insert(field.name().to_string(), serde_json::Value::String(format!("{:?}", value)));
                }
            }

            fn record_bool(&mut self, field: &tracing::field::Field, value: bool) {
                self.context.insert(field.name().to_string(), serde_json::Value::Bool(value));
            }

            fn record_i64(&mut self, field: &tracing::field::Field, value: i64) {
                self.context.insert(field.name().to_string(), serde_json::Value::Number(value.into()));
            }

            fn record_u64(&mut self, field: &tracing::field::Field, value: u64) {
                self.context.insert(field.name().to_string(), serde_json::Value::Number(value.into()));
            }
        }

        let mut visitor = EventNameVisitor {
            name: event_name.to_string(),
            context: serde_json::Map::new(),
        };
        event.record(&mut visitor);

        if visitor.name.starts_with("log ") || visitor.name == "event src/main.rs" {
            // standard logging events
            event_name = "backend.event";
        } else {
            event_name = &visitor.name;
        }

        // Only log if it's a designated structured event
        self.write_log(&level, event_name, "backend", serde_json::Value::Object(visitor.context));
    }
}
