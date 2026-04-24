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

// 通过图片路径加载图片为icon对象 只支持png格式
#[cfg(debug_assertions)]
pub fn load_image(icon_path: String) -> Option<tao::window::Icon> {
    let exe_dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
    let full_path = exe_dir.join(&icon_path);
    let png_data = std::fs::read(&full_path).ok()?;
    
    let decoder = png::Decoder::new(std::io::Cursor::new(&png_data));
    let mut reader = decoder.read_info().ok()?;
    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).ok()?;
    
    let rgba = match info.color_type {
        png::ColorType::Rgba => {
            buf[..info.buffer_size()].to_vec()
        }
        png::ColorType::Rgb => {
            // RGB → RGBA，每3字节后面插一个255（不透明）
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
    
    tao::window::Icon::from_rgba(rgba, info.width, info.height).ok()
}
#[cfg(not(debug_assertions))]
pub fn load_image(png_data: &[u8]) -> Option<tao::window::Icon> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_data));
    let mut reader = decoder.read_info().ok()?;
    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).ok()?;
    
    let rgba = match info.color_type {
        png::ColorType::Rgba => buf[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => {
            let rgb = &buf[..info.buffer_size()];
            let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
            for chunk in rgb.chunks(3) {
                rgba.extend_from_slice(chunk);
                rgba.push(255);
            }
            rgba
        }
        _ => return None,
    };
    
    tao::window::Icon::from_rgba(rgba, info.width, info.height).ok()
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