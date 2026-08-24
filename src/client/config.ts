/**
 * QQ 皮肤配置:色板变体与布局开关。
 *
 * cordis 函数插件以 `(ctx, config)` 调用,`apply` 收到的第二参即为配置。
 * 为避免引入 schemastery 依赖(workspace 内不可用),这里用纯 TS 类型 +
 * 默认值合并实现:未提供的字段回落到 `QQ_SKIN_DEFAULT_CONFIG`,非法值在
 * 合并时兜底为默认值,保证任何畸形输入都不会让皮肤挂掉。
 */

/** 可选色板:经典蓝(默认)/ 炫彩紫 / 简洁白。 */
export const QQ_SKIN_PALETTES = ['classic', 'vivid', 'clean'] as const

/** 色板标识。 */
export type QQSkinPalette = (typeof QQ_SKIN_PALETTES)[number]

/** 用户可调配置。 */
export interface QQSkinConfig {
  /** 色板变体。 */
  palette: QQSkinPalette
  /** 用户气泡右侧"尾巴"伪元素开关。 */
  bubbleTail: boolean
  /** 助手消息左侧官方 QQ 企鹅头像开关。 */
  assistantAvatar: boolean
  /** 聊天流最大宽度(px)。 */
  chatMaxWidth: number
}

/** 默认配置(与旧行为一致:经典蓝、气泡尾巴、企鹅头像、880px 宽)。 */
export const QQ_SKIN_DEFAULT_CONFIG: QQSkinConfig = {
  palette: 'classic',
  bubbleTail: true,
  assistantAvatar: true,
  chatMaxWidth: 880,
}

/** 合并用户配置与默认值,非法字段回落默认。 */
export function resolveQQSkinConfig(config?: Partial<QQSkinConfig>): QQSkinConfig {
  const raw = config ?? {}
  return {
    palette: QQ_SKIN_PALETTES.includes(raw.palette as QQSkinPalette)
      ? (raw.palette as QQSkinPalette)
      : QQ_SKIN_DEFAULT_CONFIG.palette,
    bubbleTail: typeof raw.bubbleTail === 'boolean'
      ? raw.bubbleTail
      : QQ_SKIN_DEFAULT_CONFIG.bubbleTail,
    assistantAvatar: typeof raw.assistantAvatar === 'boolean'
      ? raw.assistantAvatar
      : QQ_SKIN_DEFAULT_CONFIG.assistantAvatar,
    chatMaxWidth: typeof raw.chatMaxWidth === 'number' && raw.chatMaxWidth > 0 && Number.isFinite(raw.chatMaxWidth)
      ? raw.chatMaxWidth
      : QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth,
  }
}
