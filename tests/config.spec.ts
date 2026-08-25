import { describe, expect, it } from 'vitest'
import { QQ_SKIN_DEFAULT_CONFIG, QQ_SKIN_PALETTES, resolveQQSkinConfig } from '../src/client/config.ts'

describe('QQ skin config', () => {
  it('declares the five palette variants', () => {
    expect(QQ_SKIN_PALETTES).toEqual(['classic', 'vivid', 'clean', 'green', 'black'])
  })

  it('falls back to defaults when no config is passed', () => {
    expect(resolveQQSkinConfig()).toEqual(QQ_SKIN_DEFAULT_CONFIG)
    expect(resolveQQSkinConfig(undefined)).toEqual(QQ_SKIN_DEFAULT_CONFIG)
    expect(resolveQQSkinConfig({})).toEqual(QQ_SKIN_DEFAULT_CONFIG)
  })

  it('merges partial config over defaults', () => {
    const config = resolveQQSkinConfig({ palette: 'vivid', bubbleTail: false })
    expect(config).toEqual({ ...QQ_SKIN_DEFAULT_CONFIG, palette: 'vivid', bubbleTail: false })
  })

  it('rejects unknown palette values', () => {
    expect(resolveQQSkinConfig({ palette: 'neon' as never }).palette).toBe('classic')
  })

  it('rejects invalid scalar values', () => {
    expect(resolveQQSkinConfig({ bubbleTail: 'yes' as never }).bubbleTail).toBe(true)
    expect(resolveQQSkinConfig({ chatMaxWidth: 0 }).chatMaxWidth).toBe(QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth)
    expect(resolveQQSkinConfig({ chatMaxWidth: -10 }).chatMaxWidth).toBe(QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth)
    expect(resolveQQSkinConfig({ chatMaxWidth: Number.NaN }).chatMaxWidth).toBe(QQ_SKIN_DEFAULT_CONFIG.chatMaxWidth)
  })

  it('accepts valid scalar overrides', () => {
    const config = resolveQQSkinConfig({ chatMaxWidth: 720, assistantAvatar: false })
    expect(config.chatMaxWidth).toBe(720)
    expect(config.assistantAvatar).toBe(false)
  })
})
