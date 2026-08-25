/**
 * QQ 皮肤设置行的槽位 store:镜像设置分节快照。apply 世界的订阅回调是
 * 唯一写入方;行组件经 props.useStore 只读。
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import { QQ_SKIN_DEFAULT_CONFIG, type QQSkinConfig } from './config.ts'

/** store 状态:完整配置 + 设置分节修订号。 */
export interface QQSkinRowState {
  /** 当前生效配置(设置覆盖合并插件配置后的结果)。 */
  config: QQSkinConfig
  /** 设置分节修订号;-1 表示尚未同步过首次快照。 */
  revision: number
}

/** 声明的动作形状(给工厂导出稳定返回类型)。 */
type QQSkinRowActions = {
  sync: (draft: QQSkinRowState, config: QQSkinConfig, revision: number) => void
}

/**
 * 声明设置行状态与写面。
 * @returns store 句柄。
 */
export function createQQSkinRowStore(): EngineStoreHandle<QQSkinRowState, QQSkinRowActions> {
  return defineStore({
    init: (): QQSkinRowState => ({ config: QQ_SKIN_DEFAULT_CONFIG, revision: -1 }),
    actions: {
      sync: (d, config: QQSkinConfig, revision: number) => {
        if (revision <= d.revision) return
        d.config = { ...config }
        d.revision = revision
      },
    },
  })
}
