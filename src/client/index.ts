/**
 * QQ 皮肤浏览器半区:激活时把 QQ NT 视觉叠加到当前主题上,卸载时由
 * effect 清除。皮肤由两层可逆贡献组成——token 层(qq-tokens.ts,经
 * `ctx.theme.overrideTokens` 叠加 `--dsw-*` 双色值,按配置选色板)与
 * 布局层(qq-layout.ts,注入 QQ NT 会话窗口样式,按配置生成气泡尾巴/
 * 企鹅头像/聊天宽度)。皮肤不注册新主题 id,也不改用户偏好;两层都
 * 随 effect 清理而完整还原。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { QQ_SKIN_DEFAULT_CONFIG, resolveQQSkinConfig, type QQSkinConfig } from './config.ts'
import { buildTokenOverrides, QQ_SKIN_SOURCE } from './qq-tokens.ts'
import { installQQLayout } from './qq-layout.ts'

/** 依赖的服务:主题运行时(ui-theme 提供)。 */
export const inject = ['theme'] as const

/** 用户可调配置(schema 由宿主侧 schema-form 呈现,缺省回落默认)。 */
export type SkinConfig = QQSkinConfig

/** 默认配置(经典蓝色板、气泡尾巴、企鹅头像、880px 宽)。 */
export { QQ_SKIN_DEFAULT_CONFIG }

/**
 * 挂载 QQ NT 皮肤(布局层 + token 层)。
 * @param ctx - 客户端插件上下文。
 * @param config - 用户配置(cordis 第二参,可缺省,非法字段回落默认)。
 */
export function apply(ctx: ClientContext, config?: Partial<QQSkinConfig>): void {
  const resolved = resolveQQSkinConfig(config)
  installQQLayout(ctx, resolved)
  ctx.effect(() => ctx.theme.overrideTokens(QQ_SKIN_SOURCE, buildTokenOverrides(resolved.palette)),
    'dsh-qq-skin: QQ token layer')
}
