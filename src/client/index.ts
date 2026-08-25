/**
 * QQ 皮肤浏览器半区:激活时把 QQ NT 视觉叠加到当前主题上,卸载时由
 * effect 清除。皮肤由两层可逆贡献组成——token 层(qq-tokens.ts,经
 * `ctx.theme.overrideTokens` 叠加 `--dsw-*` 双色值,按配置选色板)与
 * 布局层(qq-layout.ts,注入 QQ NT 会话窗口样式,按配置生成气泡尾巴/
 * 企鹅头像/聊天宽度)。两层由 QQSkinRuntime 统一管理,支持热更新:
 * 配置或设置变更时重挂两层而不重启插件。皮肤不注册新主题 id,也
 * 不改用户偏好;两层都随 effect 清理而完整还原。
 *
 * 设置面板:皮肤在设置 General 区注册「QQ 皮肤」设置行(settings-store
 * + settings-row + settings-locales),色板/尾巴/头像/宽度可视化切换;
 * 变更经 SettingsScope 持久化并触发热更新。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls ui-settings 的 ctx.settingsScope 服务声明(与 ui-theme 同款)。
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls locale 服务的 ctx.locale 声明与 LocaleNamespaceMap 合并。
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { QQ_SKIN_DEFAULT_CONFIG, type QQSkinConfig } from './config.ts'
import { QQ_SKIN_SETTINGS_NS, settingsToConfig, type QQSkinSettings } from './settings.ts'
import { createQQSkinRowStore } from './settings-store.ts'
import { zh, en } from './settings-locales.ts'
import type { QQSkinRowInjected } from './settings-row.tsx'
import { QQSkinSettingsRow } from './settings-row.tsx'
import { QQSkinRuntime } from './runtime.ts'

/** 依赖的服务:主题运行时 + 槽位 + 文案 + 设置作用域。 */
export const inject = ['theme', 'slots', 'locale', 'settingsScope'] as const

/** 用户可调配置(schema 由宿主侧 schema-form 呈现,缺省回落默认)。 */
export type SkinConfig = QQSkinConfig

/** 默认配置(经典蓝色板、气泡尾巴、企鹅头像、880px 宽)。 */
export { QQ_SKIN_DEFAULT_CONFIG }

/** 设置行命名空间(注册用,跨模块共享)。 */
export { QQ_SKIN_SETTINGS_NS }

/**
 * 挂载 QQ NT 皮肤(布局层 + token 层,经 QQSkinRuntime 统一生命周期),
 * 并注册「QQ 皮肤」设置行 + 设置变更热更新。
 * @param ctx - 客户端插件上下文。
 * @param config - 用户配置(cordis 第二参,可缺省,非法字段回落默认)。
 */
export function apply(ctx: ClientContext, config?: Partial<QQSkinConfig>): void {
  // 皮肤运行时:两层挂载 + 配置热更新。
  const runtime = new QQSkinRuntime(ctx, config)

  // 设置作用域:绑定持久化分节,任意字段变更 → 合并配置 → 热更新两层,
  // 并同步设置行 store 让控件立即反映持久化结果(单一订阅)。
  const host = ctx.settingsScope.bind<QQSkinSettings>({ namespace: QQ_SKIN_SETTINGS_NS })

  // 设置行:store 镜像当前配置,inject 面写回设置作用域。
  const store = createQQSkinRowStore()
  let bound: BoundActions<typeof store> | undefined
  const syncRow = (): void => {
    bound?.sync(runtime.getConfig(), host.getSnapshot().revision ?? -1)
  }
  ctx.effect(() => host.subscribe(() => {
    const section = host.getSnapshot().value
    runtime.update(settingsToConfig(section, config))
    syncRow()
  }), 'dsh-qq-skin: settings adoption')

  // 文案:注册设置行字典。
  ctx.effect(() => ctx.locale.register('dsh-qq-skin.settings', { zh, en }), 'dsh-qq-skin: settings row dictionaries')

  const injected = (actions: BoundActions<typeof store>): QQSkinRowInjected => {
    bound = actions
    syncRow()
    const write = <K extends keyof QQSkinSettings>(field: K, value: QQSkinSettings[K]): void => {
      void host.set(field, value)
    }
    return {
      setPalette: (palette) => write('palette', palette),
      setBubbleTail: (value) => write('bubbleTail', value),
      setAssistantAvatar: (value) => write('assistantAvatar', value),
      setChatMaxWidth: (width) => write('chatMaxWidth', width),
    }
  }
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'qq-skin',
    order: 12,
    locale: 'dsh-qq-skin.settings',
    store,
    inject: injected,
  }, QQSkinSettingsRow))
}