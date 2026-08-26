/**
 * QQ 经典消息音效层:监听聊天流新增的助手消息节点,首次出现时播放一段
 * 短促的"滴滴"提示音(Web Audio 合成,零资源依赖)。
 *
 * 实现策略:两段式懒挂载——构造时先挂一个 body 级 sentinel observer
 * 监听 `[data-chat-flow]` 的出现(插件加载往往早于聊天流挂载,直接
 * querySelector 会 miss);聊天流一出现,sentinel 自动卸载并挂载真正的
 * flow observer。flow observer 监听子树新增的
 * `[data-chat-flow-kind='assistant-step']` 节点,每出现一个就播放一次。
 * 不依赖 harness 事件契约——只看 DOM,与布局层同款选择器策略。
 *
 * 浏览器自动播放策略:首次播放需在用户交互后(点击/键盘)的上下文里,
 * 否则可能被拦截。音效模块不强制突破限制,播放失败静默吞掉(音效是
 * 锦上添花,不应阻塞主流程)。
 *
 * 与布局层分工:本层只管听觉,不碰视觉几何。配置开关 `messageSound`
 * 默认关闭,避免打扰用户。卸载时两个 observer + audio 一并清理。
 */
import type { Context } from '@deepseek-ai/cordis'
import type { QQSkinConfig } from './config.ts'

/** 聊天流容器选择器(harness ChatView 的 data-chat-flow 属性)。 */
const FLOW_SELECTOR = '[data-chat-flow]'
/** 助手消息节点选择器(harness ChatNodeSeat 的 data-chat-flow-kind)。 */
const STEP_SELECTOR = "[data-chat-flow-kind='assistant-step']"

/**
 * 音效运行时:持有当前开关状态,管理 sentinel + flow 两个 observer。
 *
 * 生命周期与 cordis 一致:构造时按配置挂载 sentinel;`update` 按新
 * 配置启停整套观察链;插件 dispose 时通过 effect 清理。
 */
export class QQSoundRuntime {
  /** 当前生效配置(热更新后保持最新)。 */
  private config: QQSkinConfig
  /** sentinel observer:等 [data-chat-flow] 出现;出现后自动卸载。 */
  private sentinel: MutationObserver | undefined
  /** flow observer:监听聊天流新增 assistant-step;未启用时为 undefined。 */
  private observer: MutationObserver | undefined
  /** 已播放过的助手节点集合(避免同一节点重复播放)。 */
  private readonly played: WeakSet<Element> = new WeakSet()

  /**
   * @param ctx - 客户端插件上下文(effect 生命周期)。
   * @param config - 初始配置。
   */
  constructor(ctx: Context, config: QQSkinConfig) {
    this.config = config
    ctx.effect(() => () => this.dispose(), 'dsh-qq-skin: sound dispose')
    this.applyObserver(this.config)
  }

  /** 当前是否启用音效。 */
  isEnabled(): boolean {
    return this.config.messageSound
  }

  /**
   * 热更新:以新配置启停 observer,不重启插件。
   * @param config - 新配置。
   */
  update(config: QQSkinConfig): void {
    this.config = config
    this.disposeObserver()
    this.disposeSentinel()
    this.applyObserver(config)
  }

  /** 卸载两个 observer(插件 dispose 与热更新时共用)。 */
  dispose(): void {
    this.disposeObserver()
    this.disposeSentinel()
  }

  /** 按配置挂载 sentinel(或直接挂 flow observer 如果聊天流已存在)。 */
  private applyObserver(config: QQSkinConfig): void {
    if (!config.messageSound) return
    if (typeof document === 'undefined') return

    // 快路径:聊天流已挂载,直接观察。
    const flow = document.querySelector(FLOW_SELECTOR)
    if (flow) {
      this.mountFlowObserver(flow)
      return
    }

    // 慢路径:聊天流尚未挂载,用 sentinel observer 等它出现。
    this.sentinel = new MutationObserver((mutations) => {
      const target = document.querySelector(FLOW_SELECTOR)
      if (!target) return
      // 聊天流出现:先补扫同批挂载的首条助手消息(首次交互时序下,聊天流
      // 与首条消息往往同批出现,直接挂 flow observer 会漏掉第一声),再
      // 卸载 sentinel 并挂载 flow observer 接管后续新增。
      this.handleMutations(mutations)
      this.disposeSentinel()
      this.mountFlowObserver(target)
    })
    this.sentinel.observe(document.body, { childList: true, subtree: true })
  }

  /** 挂载 flow observer,监听聊天流子树新增的 assistant-step。 */
  private mountFlowObserver(flow: Element): void {
    this.observer = new MutationObserver((mutations) => this.handleMutations(mutations))
    this.observer.observe(flow, { childList: true, subtree: true })
  }

  /** 从 mutation 记录中提取新增的 assistant-step 并播放(去重)。 */
  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue
        // 新增节点本身是 assistant-step,或其内部包含 assistant-step。
        const targets = node.matches(STEP_SELECTOR)
          ? [node]
          : Array.from(node.querySelectorAll(STEP_SELECTOR))
        for (const target of targets) {
          if (this.played.has(target)) continue
          this.played.add(target)
          void this.playSound()
        }
      }
    }
  }

  /** 卸载 flow observer 并清空句柄。 */
  private disposeObserver(): void {
    this.observer?.disconnect()
    this.observer = undefined
  }

  /** 卸载 sentinel observer 并清空句柄。 */
  private disposeSentinel(): void {
    this.sentinel?.disconnect()
    this.sentinel = undefined
  }

  /** 播放一次"嘀嘀嘀嘀嘀嘀"提示音(Web Audio 合成,零资源依赖)。 */
  private async playSound(): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      const AudioCtor = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtor) return
      const audioCtx = new AudioCtor()
      // autoplay 策略:新建 AudioContext 多半处于 suspended 态,
      // 必须 resume() 才能发声;resume() 本身也需用户交互前置,
      // 但 harness 的发送消息已经是用户点击行为,这里顺势放行。
      if (audioCtx.state === 'suspended') await audioCtx.resume()
      const now = audioCtx.currentTime
      // QQ 经典消息提示音合成(源自马化腾的寻呼机录音):
      // - 6 声连续"嘀"(嘀嘀嘀嘀嘀嘀),中国首例声音商标
      // - 寻呼机音色:方波,音调较高,短促连续
      // - 每声嘀:120ms 持续,间隔 80ms,总时长约 1.2s
      // - 频率 2000Hz(高频"嘀"感),方波自带丰富奇次谐波
      const beep = (start: number): void => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'square'
        osc.frequency.value = 2000
        // 包络:快速 attack → 平台 → 快速 release,模拟方波脉冲
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.15, start + 0.003)
        gain.gain.setValueAtTime(0.15, start + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
        osc.connect(gain).connect(audioCtx.destination)
        osc.start(start)
        osc.stop(start + 0.12)
      }
      // 6 声嘀,每声 120ms + 间隔 80ms = 200ms 周期
      for (let i = 0; i < 6; i++) {
        beep(now + i * 0.2)
      }
      // 播放完毕后关闭 audioCtx 释放资源。
      setTimeout(() => { void audioCtx.close() }, 1500)
    } catch {
      // 自动播放策略拦截或 AudioContext 不可用,静默吞掉。
    }
  }
}
