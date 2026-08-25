import { describe, expect, it } from 'vitest'
import {
  buildTokenOverrides, QQ_SKIN_SOURCE, QQ_TOKEN_OVERRIDES,
} from '../src/client/qq-tokens.ts'
import { QQ_SKIN_PALETTES } from '../src/client/config.ts'

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

describe('QQ skin token palettes', () => {
  it('classic palette matches the legacy full set', () => {
    expect(buildTokenOverrides('classic')).toEqual(QQ_TOKEN_OVERRIDES)
  })

  it('every palette keeps the full non-empty override set', () => {
    for (const palette of QQ_SKIN_PALETTES) {
      const overrides = buildTokenOverrides(palette)
      expect(Object.keys(overrides).length, palette).toBeGreaterThan(0)
      for (const [name, modes] of Object.entries(overrides)) {
        expect(name.startsWith('--dsw-'), `${palette} ${name}`).toBe(true)
        expect(typeof modes.light, `${palette} ${name}.light`).toBe('string')
        expect(typeof modes.dark, `${palette} ${name}.dark`).toBe('string')
        expect(modes.light.trim(), `${palette} ${name}.light`).not.toBe('')
        expect(modes.dark.trim(), `${palette} ${name}.dark`).not.toBe('')
      }
    }
  })

  it('vivid palette remaps brand, bubbles and static scale to purple', () => {
    const vivid = buildTokenOverrides('vivid')
    expect(vivid['--dsw-alias-brand-primary']).toMatchObject({
      light: '#8A5CF5', dark: '#A78BFA',
    })
    expect(vivid['--dsw-specific-bubble']).toMatchObject({
      light: '#E3D9FF', dark: '#322A55',
    })
    expect(vivid['--dsw-static-deepseek-500']).toMatchObject({
      light: '#8A5CF5', dark: '#8A5CF5',
    })
    expect(vivid['--dsw-static-blue-500']).toMatchObject({
      light: '#8A5CF5', dark: '#8A5CF5',
    })
  })

  it('vivid palette keeps QQ status colors as the recognition accents', () => {
    const vivid = buildTokenOverrides('vivid')
    expect(vivid['--dsw-alias-state-success-primary']).toEqual({ light: '#07C160', dark: '#2FD57F' })
    expect(vivid['--dsw-alias-state-error-primary']).toEqual({ light: '#FA5151', dark: '#FF6B6B' })
    expect(vivid['--dsw-alias-state-warn-primary']).toEqual({ light: '#FFC300', dark: '#FFCC33' })
  })

  it('clean palette whitens surfaces while keeping blue as accent', () => {
    const clean = buildTokenOverrides('clean')
    expect(clean['--dsw-alias-bg-base']).toMatchObject({ light: '#FFFFFF' })
    expect(clean['--dsw-alias-bg-layer-1']).toMatchObject({ light: '#FFFFFF' })
    expect(clean['--dsw-alias-brand-primary']).toMatchObject({
      light: '#12B7F5', dark: '#4CB8FF',
    })
    expect(clean['--dsw-specific-bubble']).toMatchObject({ light: '#EAF4FB' })
  })

  it('green palette remaps bubbles and static scale to classic QQ green', () => {
    const green = buildTokenOverrides('green')
    expect(green['--dsw-specific-bubble']).toMatchObject({
      light: '#95EC69', dark: '#1E5C3C',
    })
    expect(green['--dsw-static-deepseek-500']).toMatchObject({
      light: '#95EC69', dark: '#95EC69',
    })
    expect(green['--dsw-static-blue-500']).toMatchObject({
      light: '#95EC69', dark: '#95EC69',
    })
    // 品牌仍为 QQ 蓝,绿只做气泡/静态色板点缀。
    expect(green['--dsw-alias-brand-primary']).toMatchObject({
      light: '#12B7F5', dark: '#4CB8FF',
    })
  })

  it('black palette deepens the dark base while keeping blue as accent', () => {
    const black = buildTokenOverrides('black')
    expect(black['--dsw-alias-bg-base']).toMatchObject({ light: '#F7F9FB', dark: '#05070B' })
    expect(black['--dsw-alias-bg-layer-1']).toMatchObject({ light: '#FFFFFF', dark: '#0B0F16' })
    expect(black['--dsw-specific-sidebar-fill']).toMatchObject({ light: '#F2F5F8', dark: '#03050A' })
    expect(black['--dsw-alias-brand-primary']).toMatchObject({
      light: '#12B7F5', dark: '#4CB8FF',
    })
  })

  it('rejects unknown palettes by falling back to classic', () => {
    expect(buildTokenOverrides('neon' as never)).toEqual(QQ_TOKEN_OVERRIDES)
  })
})
