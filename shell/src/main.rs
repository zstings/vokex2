//! Vokex Shell - 最小可用版本
//! 只做一件事：用 tao 创建窗口，用 wry 加载空白页面
//!
//! `//!` 是 Rust 的模块级注释（文档注释），描述整个文件的作用

// `#![]` 是 Rust 的属性标记，用来给编译器下指令
// `cfg_attr` 意思是"如果满足某个条件，就加上某个属性"
// `not(debug_assertions)` = 如果不是 debug 模式（即 release 模式）
// `windows_subsystem = "windows"` = 告诉 Windows：这是窗口程序，不要弹黑框控制台
// 效果：debug 编译会有控制台方便看日志，release 编译只有窗口没有控制台
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_config;
mod utils;
use utils::{load_image, get_webview_data_dir};

use std::io::{self, Read, Seek, SeekFrom};
use std::fs::File;
use std::path::Path;
use serde_json::Value;
use flate2::read::ZlibDecoder;
// `use` = 引入其他模块的东西，类似 JS 的 import
// 从 tao 库的 event 模块引入 Event（所有事件的枚举）和 WindowEvent（窗口事件的枚举）
use tao::event::{Event, WindowEvent};
// 从 tao 的 event_loop 模块引入：
// - ControlFlow：控制事件循环是否继续运行（Wait=继续等待，Exit=退出）
// - EventLoop：事件循环本身，每个 GUI 程序有且只有一个
use tao::event_loop::{ControlFlow, EventLoop};
use tao::window::WindowBuilder;


// ==============================
// 资源加载
// ==============================

const MAGIC: &[u8] = b"VOKEX";
const MAGIC_SIZE: usize = 5;
const INDEX_LENGTH_SIZE: usize = 4;
const OFFSET_SIZE: usize = 8;

#[derive(Debug)]
pub struct Resources {
    index: serde_json::Map<String, Value>,
    data: Vec<u8>,
}

impl Resources {
    pub fn load_from_exe(exe_path: &Path) -> io::Result<Self> {
        let mut file = File::open(exe_path)?;
        let file_size = file.metadata()?.len();

        if file_size < OFFSET_SIZE as u64 {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "File too small"));
        }

        file.seek(SeekFrom::End(-(OFFSET_SIZE as i64)))?;
        let mut offset_buf = [0u8; OFFSET_SIZE];
        file.read_exact(&mut offset_buf)?;
        let offset = u64::from_le_bytes(offset_buf);

        if offset >= file_size {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid offset"));
        }

        file.seek(SeekFrom::Start(offset))?;
        let mut magic_buf = [0u8; MAGIC_SIZE];
        file.read_exact(&mut magic_buf)?;

        if magic_buf != MAGIC {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid magic"));
        }

        let mut index_length_buf = [0u8; INDEX_LENGTH_SIZE];
        file.read_exact(&mut index_length_buf)?;
        let index_length = u32::from_le_bytes(index_length_buf) as usize;

        let mut index_json = vec![0u8; index_length];
        file.read_exact(&mut index_json)?;
        let index: serde_json::Map<String, Value> = serde_json::from_slice(&index_json)?;

        let compressed_data_length = file_size - offset - MAGIC_SIZE as u64 - INDEX_LENGTH_SIZE as u64 - index_length as u64 - OFFSET_SIZE as u64;
        let mut compressed_data = vec![0u8; compressed_data_length as usize];
        file.read_exact(&mut compressed_data)?;

        let mut decoder = ZlibDecoder::new(&compressed_data[..]);
        let mut data = Vec::new();
        decoder.read_to_end(&mut data)?;

        Ok(Self { index, data })
    }

    pub fn get(&self, path: &str) -> Option<&[u8]> {
        if let Some(Value::Array(offsets)) = self.index.get(path) {
            if offsets.len() == 2 {
                if let (Some(Value::Number(start)), Some(Value::Number(end))) = (
                    offsets.get(0),
                    offsets.get(1),
                ) {
                    let start = start.as_u64()? as usize;
                    let end = end.as_u64()? as usize;
                    if end <= self.data.len() {
                        return Some(&self.data[start..end]);
                    }
                }
            }
        }
        None
    }
}

// 程序入口函数
fn main() {

    // 初始化配置
    app_config::init_app_config();
    let app_config = app_config::get_config().clone();

    println!("{:#?}", app_config);

    

    // ============================================================
    // 第 1 步：创建事件循环
    // ============================================================
    // 事件循环 = 一个无限循环，不断从操作系统接收事件（点击、按键、拖动等）
    // 它是整个程序的"心脏"，所有 GUI 程序都必须有一个
    let event_loop = EventLoop::new();

    // 创建窗口（标题、大小、图标 → WindowBuilder）WindowBuilder（窗口壳子）
    let icon = load_image(app_config.icon);
    let window = WindowBuilder::new()
        .with_title(app_config.window.title)
        .with_inner_size(tao::dpi::LogicalSize::new(app_config.window.width, app_config.window.height))
        .with_window_icon(icon)
        .build(&event_loop)
        .unwrap();
    // 创建 WebView（URL、协议、数据目录 → WebViewBuilder）
    let data_dir = get_webview_data_dir(&app_config.identifier);
    let mut web_context = wry::WebContext::new(Some(data_dir));
    // WebViewBuilder（网页内容）创建 WebView（在窗口里嵌入浏览器）
    let url = app_config.dev_url.unwrap_or_else(|| "vokex://index.html".to_string());
    let mut webview_builder = wry::WebViewBuilder::new_with_web_context(&mut web_context)
        .with_url(url)
        .with_devtools(true);
    // 正式模式：注册自定义协议，加载嵌入的资源
    #[cfg(not(debug_assertions))]
    {
        let exe_path = std::env::current_exe().expect("Failed to get exe path");
        let resources = Resources::load_from_exe(&exe_path)
            .expect("Failed to load resources from exe");
        let resources = std::sync::Arc::new(resources);

        webview_builder = webview_builder.with_custom_protocol(
            "vokex".to_string(),
            move |url, _webview_id| {
                // url 是字符串，比如 "vokex://index.html" 或 "vokex://assets/style.css"
                let path = url.strip_prefix("vokex://")
                    .unwrap_or("index.html")
                    .trim_start_matches('/');
        
                if let Some(content) = resources.get(path) {
                    let mime = mime_guess::from_path(path)
                        .first_or_text_plain()
                        .to_string();
                    wry::http::Response::builder()
                        .header("Content-Type", mime)
                        .body(content.to_vec().into())
                        .unwrap()
                } else {
                    wry::http::Response::builder()
                        .status(404)
                        .body("Not Found".as_bytes().to_vec().into())
                        .unwrap()
                }
            },
        );
    }

    let _webview = webview_builder.build(&window).unwrap();

    // ============================================================
    // 第 4 步：运行事件循环
    // ============================================================
    // event_loop.run() = 启动事件循环，程序会在这里阻塞，直到退出
    //   move |event, _, control_flow| = 闭包，每次有事件时被调用
    //     move = 闭包获取外部变量的所有权（这里需要获取 window 和 webview 的所有权）
    //     event = 发生的事件（点击、按键、窗口缩放等）
    //     _ = 事件循环目标（EventLoopWindowTarget），这里不需要用，用 _ 忽略
    //     control_flow = 控制事件循环行为的引用（Wait=继续，Exit=退出）
    event_loop.run(move |event, _, control_flow| {
        // 设置默认行为：没有事件时休眠等待（不占 CPU）
        // 如果不设置，默认也是 Wait，但显式写出来更清晰
        *control_flow = ControlFlow::Wait;

        // match = Rust 的模式匹配，类似 switch-case，但更强大
        match event {
            // 匹配"窗口事件"中的"关闭请求"
            // Event::WindowEvent { event, .. } = 解构窗口事件
            //   event = 具体的窗口事件类型
            //   .. = 忽略其他字段（比如 window_id）
            // WindowEvent::CloseRequested = 用户点了窗口右上角的 X 按钮
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            // 把 control_flow 设为 Exit，事件循环会退出，程序结束
            } => *control_flow = ControlFlow::Exit,

            // _ = 其他所有事件，不处理（忽略）
            // 包括：鼠标移动、键盘输入、窗口缩放、系统托盘等
            _ => {}
        }
    });
}
