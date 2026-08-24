import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client'
import { apply, inject } from '../src/client/index.ts'
import { QQ_LAYOUT_PLUGIN, buildQQLayoutCss } from '../src/client/qq-layout.ts'
import { QQ_SKIN_SOURCE, buildTokenOverrides } from '../src/client/qq-tokens.ts'
import { QQ_SKIN_DEFAULT_CONFIG } from '../src/client/config.ts'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('dsh-qq-skin client apply', () => {
  it('declares the theme service as its only dependency', () => {
    expect(inject).toEqual(['theme'])
  })

  it('stacks the QQ override layer on activation with the default palette', () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)

    apply(ctx as never)

    expect(overrideTokens).toHaveBeenCalledTimes(1)
    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('classic'))
  })

  it('selects the palette from the plugin config', () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)

    apply(ctx as never, { palette: 'vivid' })

    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('vivid'))
  })

  it('falls back to defaults for unknown config values', () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)

    apply(ctx as never, { palette: 'neon' as never, chatMaxWidth: -1 })

    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('classic'))
  })

  it('removes the layer through the effect cleanup on dispose', async () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)

    apply(ctx as never)
    expect(dispose).not.toHaveBeenCalled()

    await ctx.fiber.dispose()

    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('leaves the theme preference untouched', async () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const ctx = new Context()
    const setTheme = vi.fn()
    ctx.provide('theme', { overrideTokens, setTheme } as unknown as ThemeRuntime)

    apply(ctx as never)
    await ctx.fiber.dispose()

    expect(setTheme).not.toHaveBeenCalled()
  })

  it('mounts the layout stylesheet alongside the token layer', () => {
    const nodes: Array<{ dataset: Record<string, string>; remove: ReturnType<typeof vi.fn> }> = []
    vi.stubGlobal('document', {
      head: { appendChild: vi.fn((el: (typeof nodes)[number]) => { nodes.push(el) }) },
      createElement: vi.fn(() => ({ dataset: {}, remove: vi.fn() })),
    })
    const dispose = vi.fn()
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens: vi.fn(() => dispose) } as unknown as ThemeRuntime)

    apply(ctx as never)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].dataset.plugin).toBe(QQ_LAYOUT_PLUGIN)
  })

  it('passes the resolved config through to the layout stylesheet', () => {
    const nodes: Array<{ dataset: Record<string, string>; textContent: string; remove: ReturnType<typeof vi.fn> }> = []
    vi.stubGlobal('document', {
      head: { appendChild: vi.fn((el: (typeof nodes)[number]) => { nodes.push(el) }) },
      createElement: vi.fn(() => ({ dataset: {}, textContent: '', remove: vi.fn() })),
    })
    const dispose = vi.fn()
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens: vi.fn(() => dispose) } as unknown as ThemeRuntime)

    apply(ctx as never, { bubbleTail: false, chatMaxWidth: 640 })

    expect(nodes).toHaveLength(1)
    expect(nodes[0].textContent).toBe(
      buildQQLayoutCss({ ...QQ_SKIN_DEFAULT_CONFIG, bubbleTail: false, chatMaxWidth: 640 }),
    )
  })
})
