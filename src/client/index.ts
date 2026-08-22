/**
 * QQ 皮肤浏览器半区：激活时把 QQ NT 视觉叠加到当前主题上，卸载时由
 * effect 清除。皮肤由两层可逆贡献组成——token 层（qq-tokens.ts，经
 * `ctx.theme.overrideTokens` 叠加 `--dsw-*` 双色值）与布局层
 * （qq-layout.ts，注入 QQ NT 会话窗口样式）。皮肤不注册新主题 id，
 * 也不改用户偏好；两层都随 effect 清理而完整还原。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { QQ_SKIN_SOURCE, QQ_TOKEN_OVERRIDES } from './qq-tokens.ts'
import { installQQLayout } from './qq-layout.ts'

/** 依赖的服务：主题运行时（ui-theme 提供）。 */
export const inject = ['theme'] as const

/**
 * 挂载 QQ NT 皮肤（布局层 + token 层）。
 * @param ctx - 客户端插件上下文。
 */
export function apply(ctx: ClientContext): void {
  installQQLayout(ctx)
  ctx.effect(() => ctx.theme.overrideTokens(QQ_SKIN_SOURCE, QQ_TOKEN_OVERRIDES),
    'dsh-qq-skin: QQ token layer')
}
