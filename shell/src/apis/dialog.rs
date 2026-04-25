use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "dialog.showMessageBox" => {
            let message = params.get("message").and_then(|v| v.as_str())
                .ok_or("Missing 'message' parameter")?;
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("提示");

            let buttons = match params.get("type").and_then(|v| v.as_str()) {
                Some("okCancel") => rfd::MessageButtons::OkCancel,
                Some("yesNo") => rfd::MessageButtons::YesNo,
                Some("yesNoCancel") => rfd::MessageButtons::YesNoCancel,
                _ => rfd::MessageButtons::Ok,
            };

            let level = match params.get("icon").and_then(|v| v.as_str()) {
                Some("warning") => rfd::MessageLevel::Warning,
                Some("error") => rfd::MessageLevel::Error,
                _ => rfd::MessageLevel::Info,
            };

            let result = rfd::MessageDialog::new()
                .set_title(title)
                .set_description(message)
                .set_level(level)
                .set_buttons(buttons)
                .show();

            let response = match result {
                rfd::MessageDialogResult::Ok => "ok",
                rfd::MessageDialogResult::Cancel => "cancel",
                rfd::MessageDialogResult::Yes => "yes",
                rfd::MessageDialogResult::No => "no",
                _ => "cancel",
            };

            Ok(json!({
                "response": response,
                "cancelled": response == "cancel"
            }))
        }

        "dialog.showErrorBox" => {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("错误");
            let message = params.get("message").and_then(|v| v.as_str()).unwrap_or("");

            rfd::MessageDialog::new()
                .set_title(title)
                .set_description(message)
                .set_level(rfd::MessageLevel::Error)
                .set_buttons(rfd::MessageButtons::Ok)
                .show();

            Ok(json!(true))
        }

        "dialog.showOpenDialog" => {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("打开文件");
            let filters = params.get("filters").and_then(|v| v.as_array());
            let multiple = params.get("multiple").and_then(|v| v.as_bool()).unwrap_or(false);

            let mut builder = rfd::FileDialog::new().set_title(title);

            if let Some(default_path) = params.get("defaultPath").and_then(|v| v.as_str()) {
                builder = builder.set_directory(default_path);
            }
            if let Some(default_name) = params.get("defaultName").and_then(|v| v.as_str()) {
                builder = builder.set_file_name(default_name);
            }

            if let Some(filter_arr) = filters {
                for filter in filter_arr {
                    if let Some(obj) = filter.as_object() {
                        let name = obj.get("name").and_then(|v| v.as_str()).unwrap_or("");
                        let extensions: Vec<String> = obj.get("extensions")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                            .unwrap_or_default();
                        if !extensions.is_empty() {
                            builder = builder.add_filter(name, &extensions);
                        }
                    }
                }
            }

            if multiple {
                let paths = builder.pick_files();
                let result: Vec<String> = paths.unwrap_or_default()
                    .iter().map(|p| p.to_string_lossy().to_string()).collect();
                Ok(json!(result))
            } else {
                let path = builder.pick_file();
                Ok(json!(path.map(|p| p.to_string_lossy().to_string())))
            }
        }

        "dialog.showSaveDialog" => {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("保存文件");
            let filters = params.get("filters").and_then(|v| v.as_array());

            let mut builder = rfd::FileDialog::new().set_title(title);

            if let Some(default_path) = params.get("defaultPath").and_then(|v| v.as_str()) {
                builder = builder.set_directory(default_path);
            }
            if let Some(default_name) = params.get("defaultName").and_then(|v| v.as_str()) {
                builder = builder.set_file_name(default_name);
            }

            if let Some(filter_arr) = filters {
                for filter in filter_arr {
                    if let Some(obj) = filter.as_object() {
                        let name = obj.get("name").and_then(|v| v.as_str()).unwrap_or("");
                        let extensions: Vec<String> = obj.get("extensions")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                            .unwrap_or_default();
                        if !extensions.is_empty() {
                            builder = builder.add_filter(name, &extensions);
                        }
                    }
                }
            }

            let path = builder.save_file();
            Ok(json!(path.map(|p| p.to_string_lossy().to_string())))
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}