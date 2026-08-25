/**
 * QQ 皮肤插件,宿主半区。浏览器半区通过 exports["./client"] 提供;宿主侧
 * 负责把 QQ 皮肤设置命名空间注册进用户设置文档(供客户端设置行读写,
 * 经 schemastery schema 校验)。
 */
import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { QQSkinSettingsSchema } from './settings-schema.ts'
import { QQ_SKIN_SETTINGS_NS } from './client/settings.ts'

/** 宿主插件体 —— 注册设置命名空间;浏览器半区贡献皮肤层。 */
export function apply(ctx: Context): void {
  const ns = settingsNamespace(QQ_SKIN_SETTINGS_NS)
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(ns, QQSkinSettingsSchema, { applies: 'live' })
  })
}