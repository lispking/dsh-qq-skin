/**
 * QQ 皮肤设置行(注册进设置 General 区的 item 槽):色板五选一、气泡
 * 尾巴/企鹅头像开关、会话宽度输入。模式与 ui-theme 的 AppearanceRow 一致
 * ——组件自绘内部、经注入面写入设置分节、store 镜像当前配置。
 *
 * 样式用内联 style 直读 `--dsw-*` token(跟随色板与亮暗),不依赖构建期
 * CSS Modules 管线——本插件的客户端 bundle 无 CSS 处理步骤。
 */
import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls ui-settings 的 SlotMap 声明合并(声明 settings.general.item
// 槽),与 ui-theme 的 AppearanceRow 同款——交叉插件协作始终走类型引用,
// 客户端 bundle 纯净性门禁不允许 value import。
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { QQ_SKIN_PALETTES, type QQSkinPalette } from './config.ts'
import type { createQQSkinRowStore } from './settings-store.ts'
import type { QQSkinSettingsKey } from './settings-locales.ts'

/** 注入的业务面:各字段的持久化写入口(经 SettingsScope.set 排队)。 */
export interface QQSkinRowInjected {
  /** 切换色板变体。 */
  setPalette: (palette: QQSkinPalette) => void
  /** 开关用户气泡尾巴。 */
  setBubbleTail: (value: boolean) => void
  /** 开关助手企鹅头像。 */
  setAssistantAvatar: (value: boolean) => void
  /** 设置会话最大宽度(px)。 */
  setChatMaxWidth: (width: number) => void
}

/** 完整组件 props:运行时份额 + store 份额 + locale 座 + 注入面。 */
export type QQSkinRowComponentProps =
  PropsRuntime<'settings.general.item'>
  & PropsStore<ReturnType<typeof createQQSkinRowStore>>
  & PropsLocale<'dsh-qq-skin.settings'>
  & QQSkinRowInjected

/** 色板选项文案键。 */
const PALETTE_LABEL_KEYS: Record<QQSkinPalette, QQSkinSettingsKey> = {
  classic: 'palette.classic',
  vivid: 'palette.vivid',
  clean: 'palette.clean',
  green: 'palette.green',
  black: 'palette.black',
}

/** 色板小圆点的展示色(light 底),纯辨识度点缀。 */
const PALETTE_DOT_COLORS: Record<QQSkinPalette, string> = {
  classic: '#12B7F5',
  vivid: '#8A5CF5',
  clean: '#EAF4FB',
  green: '#95EC69',
  black: '#0B0F16',
}

const cellStyle = {
  padding: '6px 12px',
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: '10px',
  background: 'transparent',
  color: 'var(--dsw-alias-label-primary)',
  fontSize: '13px',
  lineHeight: '20px',
  cursor: 'pointer',
} satisfies CSSProperties

/**
 * 渲染 QQ 皮肤设置行。
 * @param props - 组合后的槽位 props。
 * @returns 行元素树。
 */
export function QQSkinSettingsRow({
  t, useStore, setPalette, setBubbleTail, setAssistantAvatar, setChatMaxWidth,
}: QQSkinRowComponentProps) {
  const config = useStore(s => s.config)
  const [widthDraft, setWidthDraft] = useState(String(config.chatMaxWidth))

  const commitWidth = (): void => {
    const parsed = Number(widthDraft)
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== config.chatMaxWidth) {
      setChatMaxWidth(parsed)
    } else {
      setWidthDraft(String(config.chatMaxWidth))
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '8px',
      padding: '16px 0', borderBottom: '1px solid var(--dsw-alias-border-l2)',
    }}>
      <div style={{
        fontSize: '14px', fontWeight: 400, lineHeight: '22px',
        color: 'var(--dsw-alias-label-primary)',
      }}>{t('row.title')}</div>

      {/* 色板:五选一胶囊 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ flex: 'none', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' }}>
          {t('row.palette')}
        </span>
        <div role="radiogroup" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QQ_SKIN_PALETTES.map(palette => (
            <button
              key={palette}
              type="button"
              role="radio"
              aria-checked={config.palette === palette}
              onClick={() => { setPalette(palette) }}
              style={{
                ...cellStyle,
                borderColor: config.palette === palette
                  ? 'var(--dsw-alias-brand-primary)'
                  : 'var(--dsw-alias-border-l2)',
                background: config.palette === palette
                  ? 'var(--dsw-alias-button-ghost-active-fill)'
                  : 'transparent',
              }}
            >
              <span style={{
                display: 'inline-block', width: '8px', height: '8px',
                borderRadius: '50%', marginRight: '6px', verticalAlign: 'middle',
                backgroundColor: PALETTE_DOT_COLORS[palette],
                border: '1px solid var(--dsw-alias-border-l2)',
              }} />
              {t(PALETTE_LABEL_KEYS[palette])}
            </button>
          ))}
        </div>
      </div>

      {/* 开关:气泡尾巴 / 企鹅头像 */}
      {([
        ['row.bubbleTail', config.bubbleTail, setBubbleTail],
        ['row.assistantAvatar', config.assistantAvatar, setAssistantAvatar],
      ] as const).map(([key, value, set]) => (
        <label key={key} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '8px', cursor: 'pointer',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' }}>{t(key)}</span>
          <input
            type="checkbox"
            checked={value}
            onChange={event => { set(event.currentTarget.checked) }}
            style={{ accentColor: 'var(--dsw-alias-brand-primary)' }}
          />
        </label>
      ))}

      {/* 会话宽度:暂存草稿,失焦/回车提交(与插件卡片相同的 staged 哲学) */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 'none', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' }}>
          {t('row.chatMaxWidth')}
        </span>
        <input
          type="number"
          min={480}
          max={1600}
          value={widthDraft}
          onChange={event => { setWidthDraft(event.currentTarget.value) }}
          onBlur={commitWidth}
          onKeyDown={event => { if (event.key === 'Enter') commitWidth() }}
          style={{
            width: '96px', padding: '4px 8px',
            border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px',
            background: 'var(--dsw-specific-input-major)',
            color: 'var(--dsw-alias-label-primary)', fontSize: '13px',
          }}
        />
        <span style={{ fontSize: '12px', color: 'var(--dsw-alias-label-caption)' }}>px</span>
      </label>
    </div>
  )
}
