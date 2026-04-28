use std::env;
use std::path::PathBuf;

pub fn get_args(name: &str) -> Option<String> {
    let args: Vec<String> = env::args().collect();
    let mut i = 1;
    while i < args.len() {
        if args[i] == name {
            if i + 1 < args.len() && !args[i + 1].starts_with('-') {
                return Some(args[i + 1].clone());
            }
            return Some(String::new());
        }
        i += 1;
    }
    None
}

pub fn has_flag(name: &str) -> bool {
    let args: Vec<String> = env::args().collect();
    args.iter().any(|arg| arg == name)
}

/// 加载 PNG 图片，返回 RGBA 像素数据及宽高
/// 开发模式：从 exe 同目录的文件系统读取，正式模式：从嵌入资源读取
pub fn load_png_rgba(path: &str) -> Option<(Vec<u8>, u32, u32)> {
    let data = if crate::app_config::get_config().is_dev {
        let exe_dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
        std::fs::read(exe_dir.join(path)).ok()?
    } else {
        let exe_path = std::env::current_exe().ok()?;
        let resources = crate::Resources::load_from_exe(&exe_path).ok()?;
        resources.get(path)?.to_vec()
    };

    let decoder = png::Decoder::new(std::io::Cursor::new(&data));
    let mut reader = decoder.read_info().ok()?;
    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).ok()?;
    let rgba = match info.color_type {
        png::ColorType::Rgba => buf[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => {
            let rgb = &buf[..info.buffer_size()];
            let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
            for chunk in rgb.chunks(3) {
                rgba.push(chunk[0]);
                rgba.push(chunk[1]);
                rgba.push(chunk[2]);
                rgba.push(255);
            }
            rgba
        }
        _ => return None,
    };
    Some((rgba, info.width, info.height))
}

/// 加载图片为 tao 窗口图标
pub fn load_image(path: &str) -> Option<tao::window::Icon> {
    let (rgba, width, height) = load_png_rgba(path)?;
    tao::window::Icon::from_rgba(rgba, width, height).ok()
}

// 根据 identifier 创建 WebView 数据目录
pub fn get_webview_data_dir(identifier: &str) -> PathBuf {
    let local_appdata = std::env::var("LOCALAPPDATA")
        .unwrap_or_else(|_| {
            std::env::var("HOME").unwrap_or_else(|_| ".".to_string())
        });
    let data_dir = PathBuf::from(local_appdata).join(identifier);
    std::fs::create_dir_all(&data_dir).ok();
    data_dir
}
