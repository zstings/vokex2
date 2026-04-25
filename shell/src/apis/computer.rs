use serde_json::{json, Value};

pub fn handle(method: &str, _params: &Value) -> Result<Value, String> {
    match method {
        "computer.getCpuInfo" => {
            let mut sys = sysinfo::System::new();
            sys.refresh_cpu_all();
            let cpus = sys.cpus();
            let info = if let Some(cpu) = cpus.first() {
                json!({
                    "manufacturer": cpu.vendor_id(),
                    "model": cpu.brand(),
                    "cores": cpus.len(),
                    "logicalProcessors": cpus.len(),
                    "architecture": std::env::consts::ARCH,
                    "frequency": cpu.frequency()
                })
            } else {
                json!({})
            };
            Ok(info)
        }

        "computer.getOsInfo" => {
            Ok(json!({
                "name": sysinfo::System::name().unwrap_or_default(),
                "version": sysinfo::System::os_version().unwrap_or_default(),
                "longVersion": sysinfo::System::long_os_version().unwrap_or_default(),
                "kernelVersion": sysinfo::System::kernel_version().unwrap_or_default(),
                "platform": std::env::consts::OS,  // "windows" / "linux" / "macos"
                "arch": std::env::consts::ARCH
            }))
        }

        "computer.getMousePosition" => {
            get_mouse_position()
        }

        "computer.getKeyboardLayout" => {
            get_keyboard_layout()
        }

        "computer.getDisplays" => {
            get_displays()
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}

#[cfg(target_os = "windows")]
pub fn get_displays() -> Result<serde_json::Value, String> {
    #[repr(C)]
    struct Rect { left: i32, top: i32, right: i32, bottom: i32 }

    #[repr(C)]
    struct MonitorInfoExW {
        cb_size: u32,
        rc_monitor: Rect,
        rc_work: Rect,
        dw_flags: u32,
        sz_device: [u16; 32],
    }

    #[link(name = "user32")]
    extern "system" {
        fn EnumDisplayMonitors(hdc: isize, lprc_clip: *const u8, lpfn: Option<unsafe extern "system" fn(isize, isize, *const u8, isize) -> i32>, dw_data: isize) -> i32;
        fn GetMonitorInfoW(hmonitor: isize, lpmi: *mut MonitorInfoExW) -> i32;
    }

    unsafe extern "system" fn enum_proc(hmonitor: isize, _hdc: isize, _lprc: *const u8, data: isize) -> i32 {
        let list = &mut *(data as *mut Vec<serde_json::Value>);
        let mut mi = std::mem::zeroed::<MonitorInfoExW>();
        mi.cb_size = std::mem::size_of::<MonitorInfoExW>() as u32;
        if GetMonitorInfoW(hmonitor, &mut mi) != 0 {
            let end = mi.sz_device.iter().position(|&c| c == 0).unwrap_or(32);
            let name = String::from_utf16_lossy(&mi.sz_device[..end]);
            let w = mi.rc_monitor.right - mi.rc_monitor.left;
            let h = mi.rc_monitor.bottom - mi.rc_monitor.top;
            list.push(serde_json::json!({
                "name": name,
                "width": w,
                "height": h,
                "x": mi.rc_monitor.left,
                "y": mi.rc_monitor.top,
                "isPrimary": (mi.dw_flags & 1) != 0
            }));
        }
        1
    }

    let mut monitors: Vec<serde_json::Value> = Vec::new();
    unsafe {
        EnumDisplayMonitors(0, std::ptr::null(), Some(enum_proc), &mut monitors as *mut _ as isize);
    }

    let primary = monitors.iter()
        .find(|m| m["isPrimary"] == true)
        .and_then(|m| m["name"].as_str())
        .map(String::from);

    Ok(serde_json::json!({ "displays": monitors, "primary": primary }))
}

#[cfg(not(target_os = "windows"))]
pub fn get_displays() -> Result<serde_json::Value, String> {
    Err("getDisplays not implemented on this platform".to_string())
}

#[cfg(target_os = "windows")]
fn get_mouse_position() -> Result<serde_json::Value, String> {
    #[repr(C)]
    struct Point { x: i32, y: i32 }

    #[link(name = "user32")]
    extern "system" {
        fn GetCursorPos(lpPoint: *mut Point) -> i32;
    }

    let mut point = Point { x: 0, y: 0 };
    unsafe {
        if GetCursorPos(&mut point) != 0 {
            Ok(serde_json::json!({ "x": point.x, "y": point.y }))
        } else {
            Err("Failed to get cursor position".to_string())
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn get_mouse_position() -> Result<serde_json::Value, String> {
    Err("getMousePosition not implemented on this platform".to_string())
}

#[cfg(target_os = "windows")]
fn get_keyboard_layout() -> Result<serde_json::Value, String> {
    #[link(name = "user32")]
    extern "system" {
        fn GetKeyboardLayout(idThread: u32) -> usize;
        fn GetLocaleInfoW(locale: u32, lcType: u32, lcData: *mut u16, cchData: i32) -> i32;
    }

    unsafe {
        let hkl = GetKeyboardLayout(0);
        let lcid = (hkl & 0xFFFF) as u32; // 取低 16 位作为 LCID
        let mut buf = [0u16; 256];
        // LOCALE_SNAME = 0x5C，返回 BCP-47 名称如 "en-US"
        let len = GetLocaleInfoW(lcid, 0x5C, buf.as_mut_ptr(), buf.len() as i32);
        if len > 1 {
            let name = String::from_utf16_lossy(&buf[..len as usize - 1]);
            Ok(serde_json::json!(name))
        } else {
            Err("Failed to get keyboard layout".to_string())
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn get_keyboard_layout() -> Result<serde_json::Value, String> {
    Err("getKeyboardLayout not implemented on this platform".to_string())
}