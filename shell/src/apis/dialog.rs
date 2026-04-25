use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "dialog.showMessageBox" => {
            let message = params.get("message").and_then(|v| v.as_str())
                .ok_or("Missing 'message' parameter")?;
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("提示");
            let dialog_type = params.get("type").and_then(|v| v.as_str()).unwrap_or("info");

            let dialog = match dialog_type {
                "error" => rfd::MessageDialog::new()
                    .set_title(title)
                    .set_description(message)
                    .set_level(rfd::MessageLevel::Error),
                "warning" => rfd::MessageDialog::new()
                    .set_title(title)
                    .set_description(message)
                    .set_level(rfd::MessageLevel::Warning),
                _ => rfd::MessageDialog::new()
                    .set_title(title)
                    .set_description(message)
                    .set_level(rfd::MessageLevel::Info),
            };

            dialog.show();
            Ok(json!(true))
        }

        "dialog.showOpenDialog" => {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("打开文件");
            let filters = params.get("filters").and_then(|v| v.as_array());

            let mut builder = rfd::FileDialog::new()
                .set_title(title);

            if let Some(filter_arr) = filters {
                for filter in filter_arr {
                    if let Some(obj) = filter.as_object() {
                        let name = obj.get("name").and_then(|v| v.as_str()).unwrap_or("");
                        let extensions = obj.get("extensions")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|v| v.as_str().map(String::from))
                                    .collect::<Vec<_>>()
                            })
                            .unwrap_or_default();
                        builder = builder.add_filter(name, &extensions);
                    }
                }
            }

            let result = builder.pick_file();
            match result {
                Some(path) => Ok(json!(path.to_string_lossy().to_string())),
                None => Ok(json!(null)),
            }
        }

        "dialog.showSaveDialog" => {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("保存文件");
            let default_name = params.get("defaultName").and_then(|v| v.as_str()).unwrap_or("");
            let filters = params.get("filters").and_then(|v| v.as_array());

            let mut builder = rfd::FileDialog::new()
                .set_title(title)
                .set_file_name(default_name);

            if let Some(filter_arr) = filters {
                for filter in filter_arr {
                    if let Some(obj) = filter.as_object() {
                        let name = obj.get("name").and_then(|v| v.as_str()).unwrap_or("");
                        let extensions = obj.get("extensions")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|v| v.as_str().map(String::from))
                                    .collect::<Vec<_>>()
                            })
                            .unwrap_or_default();
                        builder = builder.add_filter(name, &extensions);
                    }
                }
            }

            let result = builder.save_file();
            match result {
                Some(path) => Ok(json!(path.to_string_lossy().to_string())),
                None => Ok(json!(null)),
            }
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}