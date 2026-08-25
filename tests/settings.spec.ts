import { describe, expect, it } from 'vitest'
import { QQ_SKIN_SETTINGS_NS, settingsToConfig, type QQSkinSettings } from '../src/client/settings.ts'

describe('QQ skin settings', () => {
  it('exports the dsh-qq-skin namespace', () => {
    expect(QQ_SKIN_SETTINGS_NS).toBe('dsh-qq-skin')
  })

  it('resolves to defaults when no setting section and no fallback', () => {
    expect(settingsToConfig(undefined)).toEqual({
      palette: 'classic', bubbleTail: true, assistantAvatar: true, chatMaxWidth: 880,
    })
  })

  it('prefers settings fields over fallback config', () => {
    const section: QQSkinSettings = { palette: 'vivid', chatMaxWidth: 720 }
    const config = settingsToConfig(section, { palette: 'clean', bubbleTail: false })
    expect(config).toEqual({
      palette: 'vivid', bubbleTail: false, assistantAvatar: true, chatMaxWidth: 720,
    })
  })

  it('fills unset settings fields from the fallback config', () => {
    const section: QQSkinSettings = { bubbleTail: false }
    const config = settingsToConfig(section, { palette: 'green', chatMaxWidth: 640 })
    expect(config).toEqual({
      palette: 'green', bubbleTail: false, assistantAvatar: true, chatMaxWidth: 640,
    })
  })
})