/**
 * QQ 皮肤运行时:持有当前配置,管理 token 层与布局层的挂载/卸载,
 * 支持热更新——配置或设置变更时在不重启插件的前提下重挂两层。
 *
 * 生命周期与 cordis 一致:构造时挂载两层;`update` 先卸载旧层再按新
 * 配置重挂(布局重建 <style>,token 层以新色板重新 override);插件
 * dispose 时通过 effect 清理完整还原。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls ui-theme 的 ctx.theme 服务声明。
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { resolveQQSkinConfig, type QQSkinConfig } from './config.ts'
import { buildTokenOverrides, QQ_SKIN_SOURCE } from './qq-tokens.ts'
import { createQQLayoutTag } from './qq-layout.ts'

/**
 * QQ 皮肤运行时。
 */
export class QQSkinRuntime {
  private readonly ctx: ClientContext
  /** 当前生效配置(热更新后保持最新)。 */
  private config: QQSkinConfig
  /** 布局层 <style> 移除函数;未挂载时为 undefined。 */
  private removeLayout: (() => void) | undefined
  /** token 层 override 清理函数;未挂载时为 undefined。 */
  private removeTokens: (() => void) | undefined

  /**
   * @param ctx - 客户端插件上下文(theme 服务已注入)。
   * @param config - 初始配置(可缺省,回落默认)。
   */
  constructor(ctx: ClientContext, config?: Partial<QQSkinConfig>) {
    this.ctx = ctx
    this.config = resolveQQSkinConfig(config)
    // 插件 dispose 时完整卸载两层;effect 清理即运行时 dispose。
    ctx.effect(() => () => this.dispose(), 'dsh-qq-skin: runtime dispose')
    this.applyLayers(this.config)
  }

  /** 当前生效配置。 */
  getConfig(): QQSkinConfig {
    return this.config
  }

  /**
   * 热更新:以新配置重挂两层,不重启插件。
   * @param config - 新配置(可缺省,回落默认)。
   */
  update(config?: Partial<QQSkinConfig>): void {
    this.config = resolveQQSkinConfig(config)
    this.disposeLayers()
    this.applyLayers(this.config)
  }

  /** 卸载两层(插件 dispose 与热更新时共用)。 */
  dispose(): void {
    this.disposeLayers()
  }

  /** 挂载两层:布局 <style> + token override(返回各自的清理函数)。 */
  private applyLayers(config: QQSkinConfig): void {
    this.removeLayout = createQQLayoutTag(config)
    this.removeTokens = this.ctx.theme.overrideTokens(QQ_SKIN_SOURCE, buildTokenOverrides(config.palette))
  }

  /** 卸载两层并清空句柄。 */
  private disposeLayers(): void {
    this.removeLayout?.()
    this.removeTokens?.()
    this.removeLayout = undefined
    this.removeTokens = undefined
  }
}
