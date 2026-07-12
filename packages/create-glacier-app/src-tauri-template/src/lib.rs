// The greet command the About page invokes. Add your own #[tauri::command]
// functions here and register them in the invoke_handler below.
#[tauri::command]
fn greet(name: &str) -> String {
    let who = if name.trim().is_empty() { "friend" } else { name };
    format!("Hello, {who}! This reply came from Rust.")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
