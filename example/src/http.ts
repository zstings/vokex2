
import { http } from "vokex.app";
import { clear, log } from "./utils";

document.getElementById("btn-http-get")?.addEventListener("click", async () => {
  clear();
  log("=== http.get() ===");
  log("请求: https://jsonplaceholder.typicode.com/todos/1");
  try {
    const response = await http.get("https://jsonplaceholder.typicode.com/todos/1");
    log(`状态码: ${response.statusCode}`);
    log(`成功: ${response.ok}`);
    log(`\n响应体:`);
    log(response.body);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-http-post")?.addEventListener("click", async () => {
  clear();
  log("=== http.post() ===");
  log("POST: https://jsonplaceholder.typicode.com/posts");
  log(`数据: ${JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2)}`);
  try {
    const data = { title: 'foo', body: 'bar', userId: 1 };
    const response = await http.post("https://jsonplaceholder.typicode.com/posts", JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    log(`\n状态码: ${response.statusCode}`);
    log(`成功: ${response.ok}`);
    log(`\n响应体:`);
    log(response.body);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});