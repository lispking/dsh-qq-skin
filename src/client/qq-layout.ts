/**
 * QQ 经典蓝布局层：以 CSS 注入方式把 harness 三栏客户端改造成经典 QQ 的
 * 会话窗口观感——聊天流居中收窄、用户气泡浅蓝带"尾巴"、助手消息左侧
 * 头像圆标 + 白色卡片、输入区胶囊化。与 token 层分工：本层只管几何与
 * 结构（圆角、间距、伪元素头像、卡片描边），颜色一律经 `--dsw-*`
 * token（qq-tokens.ts），跟随经典 QQ 蓝高辨识度色板。
 *
 * 选择器策略：客户端 CSS Modules 的类名模式为 `[hash]_[local]`（本地名
 * 保留在类名尾部），因此 `[class$="_localName"]` 可稳定命中组件内部节点；
 * 结构钩子优先使用组件源码里的 `data-*` 属性（`data-chat-flow`、
 * `data-composer-card`、`data-chat-flow-kind` 等），两者均不依赖 hash。
 * 暗色变体统一由 `body[data-ds-dark-theme]`（ui-theme 呈现器写入）门控。
 */
import type { Context } from '@deepseek-ai/cordis'
import { QQ_AVATAR_DATA_URI } from './qq-avatar.ts'

/** 注入的 <style> 标签归属标识（便于排查与测试断言）。 */
export const QQ_LAYOUT_PLUGIN = 'dsh-qq-skin/layout'

/** QQ 经典蓝布局覆盖样式：全部规则随 <style> 标签移除而还原。 */
export const QQ_LAYOUT_CSS = `
/* ── 消息流：居中收窄，像聊天窗口的画布 ─────────────────────────────── */
[data-chat-flow] {
  max-width: 880px;
  margin: 0 auto;
  padding: 16px 24px 8px;
}

/* ── 助手消息：左侧官方 QQ 企鹅头像 + 白色卡片（QQ"对方消息"观感） ──
   harness 的助手节点 kind 是 assistant-step（register-node-renderers
   注册为 'assistant-step'），不是 'assistant'；flow item 的
   data-chat-flow-kind 跟随该值。头像为腾讯官方企鹅图形（qq-avatar.ts
   的 data URI，零网络依赖，暗色下同样清晰）。

   ⚠ 选择器必须穿透 renderSlot 的 [data-slot] wrapper（SlotOutlet 用
   display: contents 的锚点 div 包在内容外）——直接子选择器
   > [class$='_root'] 因此从不命中，卡片 padding 从未生效。改为
   > [data-slot] > [class$='_root'] 精确命中 AssistantMarkdown 的
   root（避免误伤嵌套的 ReasoningRow 等同名 root）。头像 top 按
   卡片 padding-top 12px + Think 行高 24px 垂直居中：12 + 12 - 11 = 13。 */
[data-chat-flow-kind='assistant-step'] {
  position: relative;
  margin-left: 36px;
}
[data-chat-flow-kind='assistant-step']::before {
  content: '';
  position: absolute;
  top: 13px;
  left: -36px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: var(--dsw-alias-bg-layer-1);
  background-image: url("${QQ_AVATAR_DATA_URI}");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 1px 3px rgba(18, 183, 245, 0.35);
}
[data-chat-flow-kind='assistant-step'] > [data-slot] > [class$='_root'] {
  border-radius: 16px 16px 16px 6px;
  padding: 12px 16px;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
}

/* ── 用户气泡：QQ 蓝底、右上小圆角（尾巴朝右侧头像方向） ───────────── */
[class$='_bubble'] {
  border-radius: 16px 6px 16px 16px;
  box-shadow: 0 1px 2px rgba(18, 122, 175, 0.12);
}

/* ── 输入区：胶囊化浮层（QQ 底部输入条） ────────────────────────────── */
[data-composer-card] {
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(14, 22, 32, 0.08);
}

/* ── 侧边栏：会话列表观感——去掉重边框，留一像素淡分割 ──────────────── */
[class$='_sidebarCol'] {
  border-right: 1px solid var(--dsw-alias-border-l1);
}
[class$='_detailsCol'] {
  border-left: 1px solid var(--dsw-alias-border-l2);
}

/* ── 品牌区：保持产品原样 ────────────────────────────────────────────
   不隐藏鲸鱼图标、不改字标、不注入 QQ 伪元素——品牌区（sidebar.brand
   的 mark/name 插槽）原样呈现，QQ 感完全由蓝色 token 层体现。 */

/* ── 暗色微调：阴影与伪元素在深底上降噪 ────────────────────────────── */
body[data-ds-dark-theme] [class$='_bubble'] {
  box-shadow: none;
}
body[data-ds-dark-theme] [data-composer-card] {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
/* 暗色下助手卡片背景收暗（bg-layer-1 偏亮），避免整片发白。 */
body[data-ds-dark-theme] [data-chat-flow-kind='assistant-step'] > [data-slot] > [class$='_root'] {
  background: var(--dsw-alias-bg-module-platform);
}
`

/**
 * 挂载 QQ NT 布局层：注入一个全局 <style> 标签，卸载时随 effect 移除。
 * 注入方式与 ui-theme 的 installThemeStyles 一致（document + ctx.effect），
 * 不依赖任何构建期 CSS 管线——样式以内联字符串打进客户端 bundle。
 * @param ctx - 客户端插件上下文（effect 生命周期）。
 */
export function installQQLayout(ctx: Context): void {
  if (typeof document === 'undefined') return
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = QQ_LAYOUT_PLUGIN
    tag.textContent = QQ_LAYOUT_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, `${QQ_LAYOUT_PLUGIN}: stylesheet`)
}
