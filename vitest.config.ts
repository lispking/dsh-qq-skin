import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Vite 把 alias 值当作 bare specifier 走 exports map,深路径会被拒绝;
// 用 node 绝对路径作为值,则按文件直接解析,绕过 exports map。
const pkg = (name: string): string =>
  fileURLToPath(new URL(`./node_modules/@deepseek-ai/${name}/lib/types/client/index.js`, import.meta.url))

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['vitest.setup.ts'],
    environment: 'node',
    hookTimeout: 20_000,
    testTimeout: 20_000,
  },
  resolve: {
    // node 测试下,@deepseek-ai/* 的 `/client` 子路径 exports 默认指向
    // 浏览器闭包工厂(lib/client.js,顶层执行 window.__ModuleLoader__),
    // 会把 defineStore 等运行时导出吞成 undefined。这里把用到的那几个
    // 指到纯 ESM 类型产物(lib/types/client/index.js,node 可正常导入)。
    alias: {
      '@deepseek-ai/dsh-client-ui-theme/client': pkg('dsh-client-ui-theme'),
      '@deepseek-ai/dsh-client-ui-settings/client': pkg('dsh-client-ui-settings'),
      '@deepseek-ai/dsh-client-locale/client': pkg('dsh-client-locale'),
    },
  },
})
