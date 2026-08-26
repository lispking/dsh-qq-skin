import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { QQSoundRuntime } from '../src/client/qq-sound.ts'
import { QQ_SKIN_DEFAULT_CONFIG, type QQSkinConfig } from '../src/client/config.ts'

/** 默认配置 + messageSound 开。 */
const soundOn: QQSkinConfig = { ...QQ_SKIN_DEFAULT_CONFIG, messageSound: true }
/** 默认配置 + messageSound 关。 */
const soundOff: QQSkinConfig = { ...QQ_SKIN_DEFAULT_CONFIG, messageSound: false }

/** 最小 document + MutationObserver 桩。 */
function stubDocument() {
  const flow = { querySelector: vi.fn() }
  const observers: MutationObserver[] = []
  vi.stubGlobal('document', {
    querySelector: vi.fn(() => flow),
  })
  vi.stubGlobal('MutationObserver', class {
    callback: MutationCallback
    observe: (target: Node, options: MutationObserverInit) => void
    disconnect: () => void
    constructor(cb: MutationCallback) {
      this.callback = cb
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      observers.push(this as unknown as MutationObserver)
    }
  })
  return { flow, observers }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('QQSoundRuntime', () => {
  it('reports the enabled flag from config', () => {
    const ctx = new Context()
    const on = new QQSoundRuntime(ctx, soundOn)
    const off = new QQSoundRuntime(ctx, soundOff)
    expect(on.isEnabled()).toBe(true)
    expect(off.isEnabled()).toBe(false)
    void ctx.fiber.dispose()
  })

  it('does not observe when messageSound is off', () => {
    stubDocument()
    const ctx = new Context()
    const runtime = new QQSoundRuntime(ctx, soundOff)
    expect(runtime.isEnabled()).toBe(false)
    // 无 observer 被实例化——document.querySelector 不应被调用。
    expect(document.querySelector).not.toHaveBeenCalled()
    void ctx.fiber.dispose()
  })

  it('observes the chat flow when messageSound is on', () => {
    const { flow, observers } = stubDocument()
    const ctx = new Context()
    new QQSoundRuntime(ctx, soundOn)
    expect(document.querySelector).toHaveBeenCalledTimes(1)
    expect(observers).toHaveLength(1)
    expect(observers[0].observe).toHaveBeenCalledWith(flow, { childList: true, subtree: true })
    void ctx.fiber.dispose()
  })

  it('tolerates missing chat flow without throwing', () => {
    stubDocument()
    vi.stubGlobal('document', { querySelector: vi.fn(() => null) })
    const ctx = new Context()
    expect(() => new QQSoundRuntime(ctx, soundOn)).not.toThrow()
    void ctx.fiber.dispose()
  })

  it('disconnects the observer on dispose', async () => {
    const { observers } = stubDocument()
    const ctx = new Context()
    new QQSoundRuntime(ctx, soundOn)
    expect(document.querySelector).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).not.toHaveBeenCalled()
    await ctx.fiber.dispose()
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
  })

  it('plays the first assistant step that mounts together with the chat flow', () => {
    // 模拟:插件加载时聊天流尚未挂载 → sentinel 挂载;随后聊天流与首条
    // 助手消息同批挂载(首次交互常见时序),sentinel 补扫同批新增节点。
    let flow: Element | null = null
    const observers: Array<{
      callback: MutationCallback
      observe: ReturnType<typeof vi.fn>
      disconnect: ReturnType<typeof vi.fn>
    }> = []
    vi.stubGlobal('document', {
      querySelector: vi.fn(() => flow),
    })
    vi.stubGlobal('MutationObserver', class {
      callback: MutationCallback
      observe: (target: Node, options: MutationObserverInit) => void
      disconnect: () => void
      constructor(cb: MutationCallback) {
        this.callback = cb
        this.observe = vi.fn()
        this.disconnect = vi.fn()
        observers.push(this as unknown as typeof this)
      }
    })
    // Element 桩:node instanceof Element 判定用。
    class FakeElement {
      matches: (sel: string) => boolean
      querySelectorAll: (sel: string) => FakeElement[]
      constructor(matches: (sel: string) => boolean, querySelectorAll: (sel: string) => FakeElement[]) {
        this.matches = matches
        this.querySelectorAll = querySelectorAll
      }
    }
    vi.stubGlobal('Element', FakeElement)
    // window.AudioContext 桩:记录实例化次数(即 playSound 调用次数)。
    const audioCtxs: unknown[] = []
    vi.stubGlobal('window', {
      AudioContext: class {
        state = 'running'
        currentTime = 0
        destination = {}
        createOscillator = () => ({
          connect: vi.fn(() => ({ connect: vi.fn() })),
          start: vi.fn(),
          stop: vi.fn(),
          type: '',
          frequency: { value: 0 },
        })
        createGain = () => ({
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        })
        close = vi.fn()
        resume = vi.fn()
        constructor() { audioCtxs.push(this) }
      },
    })

    const ctx = new Context()
    new QQSoundRuntime(ctx, soundOn)
    // 首轮:无聊天流 → 只挂 sentinel。
    expect(observers).toHaveLength(1)

    // 模拟聊天流与首条助手消息同批挂载:flow 出现,内部已含 assistant-step。
    const step = new FakeElement(
      (sel) => sel === "[data-chat-flow-kind='assistant-step']",
      () => [],
    )
    const flowEl = new FakeElement(
      () => false,
      () => [step],
    )
    flow = flowEl
    const mutation = { addedNodes: [flowEl] } as unknown as MutationRecord
    observers[0].callback([mutation], observers[0] as unknown as MutationObserver)

    // 首条消息应触发一声提示音。
    expect(audioCtxs).toHaveLength(1)
    void ctx.fiber.dispose()
  })

  it('hot-toggles the observer when messageSound flips', () => {
    const { flow, observers } = stubDocument()
    const ctx = new Context()
    const runtime = new QQSoundRuntime(ctx, soundOn)
    // 关掉:旧 observer disconnect,新 querySelector 不再被调用。
    runtime.update(soundOff)
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    // 再开:新 observer 被创建。
    runtime.update(soundOn)
    expect(observers).toHaveLength(2)
    expect(observers[1].observe).toHaveBeenCalledWith(flow, { childList: true, subtree: true })
    void ctx.fiber.dispose()
  })
})
