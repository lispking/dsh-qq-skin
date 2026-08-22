import { describe, expect, it } from 'vitest'
import { QQ_SKIN_SOURCE, QQ_TOKEN_OVERRIDES } from '../src/client/qq-tokens.ts'

describe('QQ skin token layer', () => {
  it('names the plugin as the override source', () => {
    expect(QQ_SKIN_SOURCE).toBe('dsh-qq-skin')
  })

  it('provides a non-empty override set', () => {
    expect(Object.keys(QQ_TOKEN_OVERRIDES).length).toBeGreaterThan(0)
  })

  it('gives every token both palette modes as non-empty strings', () => {
    for (const [name, modes] of Object.entries(QQ_TOKEN_OVERRIDES)) {
      expect(name.startsWith('--dsw-'), `token name ${name}`).toBe(true)
      expect(typeof modes.light, `${name}.light`).toBe('string')
      expect(typeof modes.dark, `${name}.dark`).toBe('string')
      expect(modes.light.trim(), `${name}.light`).not.toBe('')
      expect(modes.dark.trim(), `${name}.dark`).not.toBe('')
    }
  })

  it('covers the core QQ surfaces', () => {
    expect(QQ_TOKEN_OVERRIDES['--dsw-alias-brand-primary']).toMatchObject({
      light: '#12B7F5', dark: '#4CB8FF',
    })
    expect(QQ_TOKEN_OVERRIDES['--dsw-specific-bubble']).toBeDefined()
    expect(QQ_TOKEN_OVERRIDES['--dsw-alias-bg-base']).toBeDefined()
    expect(QQ_TOKEN_OVERRIDES['--dsw-specific-sidebar-fill']).toBeDefined()
  })

  it('remaps the static blue palette so no default deepseek blue leaks', () => {
    // Components referencing --dsw-static-* directly (ChatView gradient,
    // StateDot, TrajectoryTable, ContextMeter) must render QQ sky blue, not
    // the harness default deepseek blue-purple #416EE6.
    expect(QQ_TOKEN_OVERRIDES['--dsw-static-deepseek-500']).toMatchObject({
      light: '#12B7F5', dark: '#12B7F5',
    })
    expect(QQ_TOKEN_OVERRIDES['--dsw-static-blue-500']).toMatchObject({
      light: '#12B7F5', dark: '#12B7F5',
    })
    expect(QQ_TOKEN_OVERRIDES['--dsw-static-deepseek-50']).toBeDefined()
    expect(QQ_TOKEN_OVERRIDES['--dsw-static-blue-950']).toBeDefined()
  })

  it('distinguishes light from dark where the palette varies', () => {
    const brand = QQ_TOKEN_OVERRIDES['--dsw-alias-brand-primary']!
    expect(brand.light).not.toBe(brand.dark)
    const bubble = QQ_TOKEN_OVERRIDES['--dsw-specific-bubble']!
    expect(bubble.light).not.toBe(bubble.dark)
  })

  it('is free of placeholder values', () => {
    for (const modes of Object.values(QQ_TOKEN_OVERRIDES)) {
      expect(modes.light).not.toMatch(/placeholder|TODO|undefined|NaN/)
      expect(modes.dark).not.toMatch(/placeholder|TODO|undefined|NaN/)
    }
  })
})
