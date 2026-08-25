import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client'
import { QQSkinRuntime } from '../src/client/runtime.ts'
import { QQ_SKIN_SOURCE, buildTokenOverrides } from '../src/client/qq-tokens.ts'
import { QQ_LAYOUT_PLUGIN } from '../src/client/qq-layout.ts'
import { QQ_SKIN_DEFAULT_CONFIG } from '../src/client/config.ts'

function stubDocument() {
  const nodes: Array<{ dataset: Record<string, string>; textContent: string; remove: ReturnType<typeof vi.fn> }> = []
  vi.stubGlobal('document', {
    head: { appendChild: vi.fn((el: (typeof nodes)[number]) => { nodes.push(el) }) },
    createElement: vi.fn(() => ({ dataset: {}, textContent: '', remove: vi.fn() })),
  })
  return nodes
}

/** 最小 ctx:仅 theme 服务;无 DOM 时不建 style 标签(runtime 容错)。 */
function makeCtx(overrideTokens = vi.fn(() => vi.fn())) {
  const ctx = new Context()
  ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)
  return { ctx, overrideTokens }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('QQSkinRuntime', () => {
  it('mounts two layers on construction', () => {
    const nodes = stubDocument()
    const { ctx, overrideTokens } = makeCtx()
    const runtime = new QQSkinRuntime(ctx as never)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].dataset.plugin).toBe(QQ_LAYOUT_PLUGIN)
    expect(overrideTokens).toHaveBeenCalledTimes(1)
    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('classic'))
    runtime.dispose()
  })

  it('re-applies both layers on hot update without disposing the runtime', () => {
    const nodes = stubDocument()
    const { ctx, overrideTokens } = makeCtx()
    const runtime = new QQSkinRuntime(ctx as never)
    const firstLayout = nodes[0]
    expect(firstLayout.remove).not.toHaveBeenCalled()

    runtime.update({ palette: 'vivid', chatMaxWidth: 720 })

    // 旧布局移除、旧 token override 清理,并重新挂载两层。
    expect(firstLayout.remove).toHaveBeenCalledTimes(1)
    expect(nodes).toHaveLength(2)
    expect(nodes[1].textContent).toContain('max-width: 720px')
    expect(overrideTokens).toHaveBeenLastCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('vivid'))
    runtime.dispose()
  })

  it('exposes the resolved config after update', () => {
    const { ctx } = makeCtx()
    const runtime = new QQSkinRuntime(ctx as never, { bubbleTail: false })
    expect(runtime.getConfig()).toEqual({ ...QQ_SKIN_DEFAULT_CONFIG, bubbleTail: false })

    runtime.update({ palette: 'black' })
    expect(runtime.getConfig().palette).toBe('black')
    runtime.dispose()
  })

  it('dispose removes both layers and clears handles idempotently', () => {
    const nodes = stubDocument()
    const dispose = vi.fn()
    const { ctx, overrideTokens } = makeCtx(() => dispose)
    const runtime = new QQSkinRuntime(ctx as never)

    runtime.dispose()
    expect(nodes[0].remove).toHaveBeenCalledTimes(1)
    expect(dispose).toHaveBeenCalledTimes(1)

    // 幂等:再次 dispose 不再重复清理。
    runtime.dispose()
    expect(nodes[0].remove).toHaveBeenCalledTimes(1)
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('plugin dispose tears the runtime layers through the effect cleanup', async () => {
    const nodes = stubDocument()
    const { ctx, overrideTokens } = makeCtx()
    // apply 同款坐标系:运行时由 ctx.effect 托管,dispose fiber 时清理。
    new QQSkinRuntime(ctx as never)
    await ctx.fiber.dispose()
    expect(nodes[0].remove).toHaveBeenCalledTimes(1)
    expect(overrideTokens.mock.calls[0]![1]).toEqual(buildTokenOverrides('classic'))
  })
})