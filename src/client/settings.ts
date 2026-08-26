/**
 * QQ 皮肤设置命名空间与类型:宿主侧注册进用户设置文档,客户端经
 * `ctx.settingsScope.bind({ namespace })` 读写同一份持久化配置。
 *
 * 与 `config.ts` 的分工:config.ts 是插件自身的 cordis 配置(apply 第二
 * 参,静态,启动时读取);settings 是用户在设置面板里改的持久化覆盖,
 * 经设置行(settings-row.tsx)写入、运行时(QQSkinRuntime)热更新生效。
 * 两份数据形状一致(都是 QQSkinConfig 的字段),通过 settingsToConfig
 * 合并:settings 覆盖优先,未覆盖字段回落 config 默认。
 *
 * ⚠ 本文件保持零运行时依赖(不 import schemastery/react),客户端 bundle
 * 与宿主 schema 均可安全引用;schema 本体放宿主侧(settings-schema.ts)。
 */
import { type QQSkinConfig, type QQSkinPalette } from './config.ts'

/** 设置命名空间(宿主 settings.register 与客户端 settingsScope 共用)。 */
export const QQ_SKIN_SETTINGS_NS = 'dsh-qq-skin'

/** 设置文档里的持久化分节:形状与 QQSkinConfig 一致,全部可缺省。 */
export interface QQSkinSettings {
  palette?: QQSkinPalette
  bubbleTail?: boolean
  assistantAvatar?: boolean
  chatMaxWidth?: number
  messageSound?: boolean
  typing?: boolean
}

/**
 * 把设置分节合并为完整配置(设置字段优先,缺省回落默认)。
 * @param section - 设置文档分节;undefined 视为未设置。
 * @param fallback - 插件自身配置(apply 第二参),作为设置未覆盖时的底座。
 * @returns 合并后的完整配置。
 */
export function settingsToConfig(
  section: QQSkinSettings | undefined,
  fallback?: Partial<QQSkinConfig>,
): QQSkinConfig {
  const s = section ?? {}
  return {
    palette: s.palette ?? fallback?.palette ?? 'classic',
    bubbleTail: s.bubbleTail ?? fallback?.bubbleTail ?? true,
    assistantAvatar: s.assistantAvatar ?? fallback?.assistantAvatar ?? true,
    chatMaxWidth: s.chatMaxWidth ?? fallback?.chatMaxWidth ?? 880,
    messageSound: s.messageSound ?? fallback?.messageSound ?? false,
    typing: s.typing ?? fallback?.typing ?? true,
  }
}
