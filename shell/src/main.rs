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

// `use` = 引入其他模块的东西，类似 JS 的 import
// 从 tao 库的 event 模块引入 Event（所有事件的枚举）和 WindowEvent（窗口事件的枚举）
use tao::event::{Event, WindowEvent};

// 从 tao 的 event_loop 模块引入：
// - ControlFlow：控制事件循环是否继续运行（Wait=继续等待，Exit=退出）
// - EventLoop：事件循环本身，每个 GUI 程序有且只有一个
use tao::event_loop::{ControlFlow, EventLoop};

// 从 tao 的 window 模块引入 WindowBuilder，用来配置和创建窗口
use tao::window::WindowBuilder;

// 从 wry 库引入 Response，用来构造 HTTP 响应（给自定义协议返回网页内容）
use wry::http::Response;

// 从 wry 库引入 WebViewBuilder，用来配置和创建 WebView（网页渲染区域）
use wry::WebViewBuilder;

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
    let _webview = wry::WebViewBuilder::new_with_web_context(&mut web_context)
        .with_url("http://localhost:5173/")
        .with_devtools(true)
        .build(&window)
        .unwrap();

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
