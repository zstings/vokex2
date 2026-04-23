import { defineConfig } from "vite";
import { vokexPlugin } from "vokex/vite-plugin";
import { version } from "./package.json";

export default defineConfig(({mode}) => {
  console.log(mode)
  return {
    plugins: [
      vokexPlugin({
        name: "Vokex Demo",
        identifier: "com.vokex.vokex",
        version: version,
        icon: "icon/icon.png",
        window: {
          title: "Vokex App Demo",
          width: 1200,
          height: 800,
          center: true,
        },
        verbose: true,
        devtools: mode == 'development',
        new_window: {
          value: 1
        }
      }),
    ],
    build: {
      rollupOptions: {
        input: {
          index: 'index.html',
          test: 'test.html',  // 加入构建
        }
      }
    }
  }
});
