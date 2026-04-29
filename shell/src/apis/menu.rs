use serde_json::Value;
use muda::{Menu, MenuItem, CheckMenuItem, Submenu, PredefinedMenuItem};
use std::cell::RefCell;
#[cfg(target_os = "windows")]
use raw_window_handle::HasWindowHandle;

thread_local! {
    static APP_MENU: RefCell<Option<Menu>> = RefCell::new(None);
}

fn build_menu_items(items: &Value) -> Result<Vec<Box<dyn muda::IsMenuItem>>, String> {
    let mut result: Vec<Box<dyn muda::IsMenuItem>> = Vec::new();
    if let Some(arr) = items.as_array() {
        for item in arr {
            if let Some(obj) = item.as_object() {
                let item_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("normal");
                match item_type {
                    "separator" => {
                        result.push(Box::new(PredefinedMenuItem::separator()));
                    }
                    "submenu" => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let submenu_value = obj.get("submenu").cloned().unwrap_or(Value::Array(vec![]));
                        let sub_items = build_menu_items(&submenu_value)?;
                        let refs: Vec<&dyn muda::IsMenuItem> = sub_items.iter().map(|i| i.as_ref()).collect();
                        let submenu = Submenu::with_items(label, true, &refs)
                            .map_err(|e| format!("Failed to create submenu: {}", e))?;
                        result.push(Box::new(submenu));
                    }
                    "checkbox" => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let enabled = obj.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true);
                        let checked = obj.get("checked").and_then(|v| v.as_bool()).unwrap_or(false);
                        let id = obj.get("id").and_then(|v| v.as_str()).unwrap_or("");
                        let menu_item = CheckMenuItem::with_id(id, label, enabled, checked, None);
                        result.push(Box::new(menu_item));
                    }
                    "native" => {
                        let native_label = obj.get("nativeLabel").and_then(|v| v.as_str()).unwrap_or("");
                        let item: PredefinedMenuItem = match native_label {
                            "separator" => PredefinedMenuItem::separator(),
                            "copy" => PredefinedMenuItem::copy(None),
                            "cut" => PredefinedMenuItem::cut(None),
                            "paste" => PredefinedMenuItem::paste(None),
                            "selectAll" => PredefinedMenuItem::select_all(None),
                            "undo" => PredefinedMenuItem::undo(None),
                            "redo" => PredefinedMenuItem::redo(None),
                            "minimize" => PredefinedMenuItem::minimize(None),
                            "maximize" => PredefinedMenuItem::maximize(None),
                            "fullscreen" => PredefinedMenuItem::fullscreen(None),
                            "hide" => PredefinedMenuItem::hide(None),
                            "hideOthers" => PredefinedMenuItem::hide_others(None),
                            "showAll" => PredefinedMenuItem::show_all(None),
                            "closeWindow" => PredefinedMenuItem::close_window(None),
                            "quit" => PredefinedMenuItem::quit(None),
                            "about" => PredefinedMenuItem::about(None, None),
                            "services" => PredefinedMenuItem::services(None),
                            "bringAllToFront" => PredefinedMenuItem::bring_all_to_front(None),
                            _ => {
                                return Err(format!("Unknown native label: {}", native_label));
                            }
                        };
                        result.push(Box::new(item));
                    }
                    _ => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let enabled = obj.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true);
                        let id = obj.get("id").and_then(|v| v.as_str()).unwrap_or("");
                        let menu_item = MenuItem::with_id(id, label, enabled, None);
                        result.push(Box::new(menu_item));
                    }
                }
            }
        }
    }
    Ok(result)
}

pub fn build_menu(items: &Value) -> Result<Menu, String> {
    let menu = Menu::new();
    let menu_items = build_menu_items(items)?;
    for item in &menu_items {
        menu.append(item.as_ref()).map_err(|e| format!("{}", e))?;
    }
    Ok(menu)
}

/// 清空 Menu 中的所有菜单项（不 detach 窗口子类化）
fn clear_menu_items(menu: &Menu) {
    let old_items = menu.items();
    for item in old_items.iter().rev() {
        if let Some(i) = item.as_menuitem() {
            let _ = menu.remove(i);
        } else if let Some(i) = item.as_check_menuitem() {
            let _ = menu.remove(i);
        } else if let Some(i) = item.as_submenu() {
            let _ = menu.remove(i);
        } else if let Some(i) = item.as_predefined_menuitem() {
            let _ = menu.remove(i);
        } else if let Some(i) = item.as_icon_menuitem() {
            let _ = menu.remove(i);
        }
    }
}

/// 设置原生应用菜单栏
///
/// 首次调用：创建 Menu 并挂载到窗口（init_for_hwnd + SetWindowPos），仅此一次
/// 后续调用：复用已有 Menu，只清空并重新填充内容
/// removeApplicationMenu 也只清空内容，不 detach 窗口子类化
/// 整个生命周期内 init_for_hwnd 只调用一次，避免 muda 子类化反复挂载/卸载导致崩溃
pub fn set_application_menu(template: &Value) -> Result<(), String> {
    let new_items = build_menu_items(template)?;

    APP_MENU.with(|m| {
        let mut guard = m.borrow_mut();

        if let Some(existing_menu) = guard.as_mut() {
            // 复用已有菜单：清空旧项 → 添加新项
            clear_menu_items(existing_menu);
            for item in &new_items {
                existing_menu.append(item.as_ref())
                    .map_err(|e| format!("{}", e))?;
            }
        } else {
            // 首次：创建菜单并挂载到窗口（唯一一次 init_for_hwnd + SetWindowPos）
            let menu = Menu::new();
            for item in &new_items {
                menu.append(item.as_ref())
                    .map_err(|e| format!("{}", e))?;
            }
            #[cfg(target_os = "windows")]
            { set_menu_windows(&menu)?; }
            #[cfg(target_os = "macos")]
            { menu.init_for_nsapp(); }
            #[cfg(not(any(target_os = "windows", target_os = "macos")))]
            { return Err("Application menu not supported on this platform".to_string()); }
            *guard = Some(menu);
        }

        Ok(())
    })
}

#[cfg(target_os = "windows")]
fn set_menu_windows(menu: &Menu) -> Result<(), String> {
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        SetWindowPos, SWP_FRAMECHANGED, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER, SWP_NOACTIVATE,
    };

    let hwnd = crate::window_manager::MANAGER.with(|m| {
        let manager = m.borrow();
        let entry = manager.get(1).ok_or("主窗口不存在")?;
        let handle = entry.window.window_handle()
            .map_err(|e| format!("获取窗口句柄失败: {}", e))?;
        let raw = handle.as_raw();
        match raw {
            raw_window_handle::RawWindowHandle::Win32(h) => Ok(h.hwnd.get() as isize),
            _ => Err("不是 Windows 窗口".to_string()),
        }
    })?;

    unsafe {
        menu.init_for_hwnd(hwnd)
            .map_err(|e| format!("菜单挂载失败: {}", e))?;

        // 强制窗口重新计算非客户区，触发 WM_NCCALCSIZE → WM_SIZE，
        // 使 WebView2 的渲染区域让出菜单栏空间。之前方案失败的关键遗漏步骤。
        SetWindowPos(
            hwnd as _,
            0,
            0, 0, 0, 0,
            SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE,
        );
    }

    Ok(())
}

/// 移除应用菜单栏
///
/// 只清空菜单项内容，不 detach 窗口子类化。
/// Menu 对象保留在 APP_MENU 中，后续 setApplicationMenu 可直接复用。
pub fn remove_application_menu() {
    APP_MENU.with(|m| {
        let guard = m.borrow();
        if let Some(existing_menu) = guard.as_ref() {
            clear_menu_items(existing_menu);
        }
    });
}
