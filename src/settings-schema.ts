/**
 * QQ 皮肤设置命名空间的宿主侧 schema(schemastery)。仅宿主进程引用,
 * 客户端 bundle 不 import 本文件(schemastery 是宿主侧依赖,不进浏览器)。
 * 注册入口见 src/index.ts 的 `ctx.inject(['settings'], ...)`。
 */
import z from '@deepseek-ai/schemastery'
import { QQ_SKIN_PALETTES } from './client/config.ts'
import type { QQSkinSettings } from './client/settings.ts'

/** 设置分节的 schemastery schema;宿主注册、设置面板渲染共用。 */
export const QQSkinSettingsSchema: z<QQSkinSettings> = z.object({
  palette: z.union([...QQ_SKIN_PALETTES]).default('classic'),
  bubbleTail: z.boolean().default(true),
  assistantAvatar: z.boolean().default(true),
  chatMaxWidth: z.number().min(480).max(1600).default(880),
})
