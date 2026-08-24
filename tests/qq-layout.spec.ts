import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import {
  buildQQLayoutCss, installQQLayout, QQ_LAYOUT_CSS, QQ_LAYOUT_PLUGIN,
} from '../src/client/qq-layout.ts'
import { QQ_SKIN_DEFAULT_CONFIG } from '../src/client/config.ts'

/** Minimal document/head stand-in for the DOM injection under node. */
function stubDocument() {
  const nodes: Array<{ dataset: Record<string, string>; textContent: string; remove: ReturnType<typeof vi.fn> }> = []
  const document = {
    head: {
      appendChild: vi.fn((el: (typeof nodes)[number]) => { nodes.push(el) }),
    },
    createElement: vi.fn(() => {
      const node = { dataset: {}, textContent: '', remove: vi.fn() }
      return node
    }),
  }
  vi.stubGlobal('document', document)
  return { document, nodes }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('QQ NT layout layer', () => {
  it('exposes a stylesheet covering the QQ NT layout hooks', () => {
    expect(QQ_LAYOUT_CSS).toContain("[data-chat-flow]")
    expect(QQ_LAYOUT_CSS).toContain("[data-composer-card]")
    expect(QQ_LAYOUT_CSS).toContain("[data-chat-flow-kind='assistant-step']")
    expect(QQ_LAYOUT_CSS).toContain("body[data-ds-dark-theme]")
  })

  it('colors follow tokens instead of hardcoded values', () => {
    // Surface colors must read --dsw-* tokens so the layer tracks the active
    // palette (qq-tokens.ts) in both modes; the assistant avatar is the one
    // exception — an embedded official QQ-penguin PNG brand asset (data URI,
    // no network).
    expect(QQ_LAYOUT_CSS).toContain('var(--dsw-alias-bg-layer-1)')
    expect(QQ_LAYOUT_CSS).toContain('var(--dsw-alias-border-l1)')
    expect(QQ_LAYOUT_CSS).not.toMatch(/#[0-9a-fA-F]{6}/)
  })

  it('embeds the official QQ-penguin avatar as a network-free data URI', () => {
    expect(QQ_LAYOUT_CSS).toContain("data:image/png;base64")
    expect(QQ_LAYOUT_CSS).toContain("[data-chat-flow-kind='assistant-step']::before")
  })

  it('injects one tagged stylesheet on activation', () => {
    const { nodes } = stubDocument()
    const ctx = new Context()
    installQQLayout(ctx as never)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].dataset.plugin).toBe(QQ_LAYOUT_PLUGIN)
    expect(nodes[0].textContent).toBe(QQ_LAYOUT_CSS)
  })

  it('removes the stylesheet through the effect cleanup on dispose', async () => {
    const { nodes } = stubDocument()
    const ctx = new Context()
    installQQLayout(ctx as never)

    const tag = nodes[0]
    expect(tag.remove).not.toHaveBeenCalled()

    await ctx.fiber.dispose()

    expect(tag.remove).toHaveBeenCalledTimes(1)
  })
})

describe('QQ NT layout config branches', () => {
  it('bubble tail rule appears by default and can be disabled', () => {
    const tailRule = `[class$='_bubble']::after`
    expect(QQ_LAYOUT_CSS).toContain(tailRule)
    const off = buildQQLayoutCss({ ...QQ_SKIN_DEFAULT_CONFIG, bubbleTail: false })
    expect(off).not.toContain(tailRule)
    // The dark-mode tail companion follows the same switch.
    expect(off).not.toContain(`body[data-ds-dark-theme] [class$='_bubble']::after`)
  })

  it('assistant avatar rule appears by default and can be disabled', () => {
    const avatarRule = "[data-chat-flow-kind='assistant-step']::before"
    expect(QQ_LAYOUT_CSS).toContain(avatarRule)
    const off = buildQQLayoutCss({ ...QQ_SKIN_DEFAULT_CONFIG, assistantAvatar: false })
    expect(off).not.toContain(avatarRule)
  })

  it('chat flow width follows the config value', () => {
    expect(QQ_LAYOUT_CSS).toContain(`max-width: ${QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth}px`)
    const narrow = buildQQLayoutCss({ ...QQ_SKIN_DEFAULT_CONFIG, chatMaxWidth: 720 })
    expect(narrow).toContain('max-width: 720px')
    expect(narrow).not.toContain(`max-width: ${QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth}px`)
  })

  it('covers the QQ NT conversation chrome hooks', () => {
    expect(QQ_LAYOUT_CSS).toContain("header[class$='_header']")
    expect(QQ_LAYOUT_CSS).toContain("[data-time-hover-root]")
    expect(QQ_LAYOUT_CSS).toContain("[data-conversation-scroll]")
    expect(QQ_LAYOUT_CSS).toContain("[class$='_tools'] button")
  })
})
