import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ThemeRuntime } from '@deepseek-ai/dsh-client-ui-theme/client'
import { apply, inject, QQ_SKIN_SETTINGS_NS } from '../src/client/index.ts'
import { QQ_LAYOUT_PLUGIN } from '../src/client/qq-layout.ts'
import { QQ_SKIN_SOURCE, buildTokenOverrides } from '../src/client/qq-tokens.ts'
import { QQ_SKIN_DEFAULT_CONFIG } from '../src/client/config.ts'

/** 最小 ctx:theme + settingsScope + slots + locale stub,供 apply 走完全链。 */
function makeCtx(overrideTokens = vi.fn(() => vi.fn())) {
  const ctx = new Context()
  ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)
  const listeners: Array<() => void> = []
  ctx.provide('settingsScope', {
    bind: () => ({
      getSnapshot: () => ({ status: 'ready', value: undefined, revision: 0 }),
      subscribe: (fn: () => void) => { listeners.push(fn); return () => {} },
    }),
  } as never)
  ctx.provide('slots', { inject: () => {}, register: () => () => {} } as never)
  ctx.provide('locale', { register: () => () => {} } as never)
  return { ctx, overrideTokens }
}

/** stub <style> 注入用的最小 document。 */
function stubDocument() {
  const nodes: Array<{ dataset: Record<string, string>; textContent: string; remove: ReturnType<typeof vi.fn> }> = []
  vi.stubGlobal('document', {
    head: { appendChild: vi.fn((el: (typeof nodes)[number]) => { nodes.push(el) }) },
    createElement: vi.fn(() => ({ dataset: {}, textContent: '', remove: vi.fn() })),
  })
  return nodes
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('dsh-qq-skin client apply', () => {
  it('declares theme plus settings-collaboration services', () => {
    expect(inject).toEqual(['theme', 'slots', 'locale', 'settingsScope'])
  })

  it('stacks the QQ override layer on activation with the default palette', () => {
    const overrideTokens = vi.fn(() => vi.fn())
    const { ctx } = makeCtx(overrideTokens)

    apply(ctx as never)

    expect(overrideTokens).toHaveBeenCalledTimes(1)
    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('classic'))
  })

  it('selects the palette from the plugin config', () => {
    const overrideTokens = vi.fn(() => vi.fn())
    const { ctx } = makeCtx(overrideTokens)

    apply(ctx as never, { palette: 'vivid' })

    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('vivid'))
  })

  it('falls back to defaults for unknown config values', () => {
    const overrideTokens = vi.fn(() => vi.fn())
    const { ctx } = makeCtx(overrideTokens)

    apply(ctx as never, { palette: 'neon' as never, chatMaxWidth: -1 })

    expect(overrideTokens).toHaveBeenCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('classic'))
  })

  it('hot-updates both layers when the settings section changes', async () => {
    const nodes = stubDocument()
    const overrideTokens = vi.fn(() => vi.fn())
    let listenerFn: (() => void) | undefined
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as unknown as ThemeRuntime)
    const section = { palette: 'classic' as const }
    let revision = 0
    ctx.provide('settingsScope', {
      bind: () => ({
        getSnapshot: () => ({ status: 'ready' as const, value: section, revision }),
        subscribe: (fn: () => void) => { listenerFn = fn; return () => {} },
      }),
    } as never)
    ctx.provide('slots', { inject: () => {}, register: () => () => {} } as never)
    ctx.provide('locale', { register: () => () => {} } as never)

    apply(ctx as never, {})

    // 首次:classic。
    expect(nodes).toHaveLength(1)

    // 模拟设置持久化:palette → vivid,触发器把旧的 <style> 重建为 vivid。
    nodes[0].remove.mockClear()
    section.palette = 'vivid'
    revision = 1
    listenerFn?.()

    expect(overrideTokens).toHaveBeenLastCalledWith(QQ_SKIN_SOURCE, buildTokenOverrides('vivid'))
  })

  it('removes the layer through the effect cleanup on dispose', async () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const { ctx } = makeCtx(overrideTokens)

    apply(ctx as never)
    expect(dispose).not.toHaveBeenCalled()

    await ctx.fiber.dispose()

    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('leaves the theme preference untouched', async () => {
    const dispose = vi.fn()
    const overrideTokens = vi.fn(() => dispose)
    const setTheme = vi.fn()
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens, setTheme } as unknown as ThemeRuntime)
    ctx.provide('settingsScope', {
      bind: () => ({
        getSnapshot: () => ({ status: 'ready', value: undefined, revision: 0 }),
        subscribe: () => () => {},
      }),
    } as never)
    ctx.provide('slots', { inject: () => {}, register: () => () => {} } as never)
    ctx.provide('locale', { register: () => () => {} } as never)

    apply(ctx as never)
    await ctx.fiber.dispose()

    expect(setTheme).not.toHaveBeenCalled()
  })

  it('mounts the layout stylesheet alongside the token layer', () => {
    const nodes = stubDocument()
    const overrideTokens = vi.fn(() => vi.fn())
    const { ctx } = makeCtx(overrideTokens)

    apply(ctx as never)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].dataset.plugin).toBe(QQ_LAYOUT_PLUGIN)
  })

  it('registers the QQ skin settings row entry', () => {
    const register = vi.fn(() => () => {})
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens: vi.fn(() => vi.fn()) } as unknown as ThemeRuntime)
    ctx.provide('settingsScope', {
      bind: () => ({
        getSnapshot: () => ({ status: 'ready', value: undefined, revision: 0 }),
        subscribe: () => () => {},
      }),
    } as never)
    ctx.provide('slots', {
      inject: (_: string, thunk: () => () => void) => { thunk() },
      register,
    } as never)
    ctx.provide('locale', { register: () => () => {} } as never)

    apply(ctx as never)

    expect(register).toHaveBeenCalledTimes(1)
    const options = register.mock.calls[0]![0]
    expect(options.id).toBe('qq-skin')
    expect(options.name).toBe('settings.general.item')
  })
})
