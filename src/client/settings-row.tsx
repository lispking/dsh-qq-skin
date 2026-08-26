/**
 * QQ 皮肤设置行(注册进设置 General 区的 item 槽):色板五选一、气泡
 * 尾巴/企鹅头像开关、会话宽度输入。
 *
 * 视觉语言与宿主设置行对齐:
 * - 色板用 ui-theme AppearanceRow 同款 16px 圆角卡片(flex 布局 + hover
 *   底色 + 选中态 `bg-module-platform`/bluish-400 描边),卡片内以
 *   渐变色块预览该色板,文案在下;
 * - 开关用 QQ NT 风格圆角 switch(非原生 checkbox),轨道/滑块走
 *   `--dsw-*` token;
 * - 标题与「标题+控件左右排布」对齐 locale LanguageRow 的 14px 行。
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
  /** 开关消息提示音。 */
  setMessageSound: (value: boolean) => void
  /** 开关打字机揭示动效。 */
  setTyping: (value: boolean) => void
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

/** 色板卡片的渐变色块预览(亮色代表色,纯辨识度点缀,不参与主题)。 */
const PALETTE_PREVIEW: Record<QQSkinPalette, string> = {
  classic: 'linear-gradient(135deg, #12B7F5 0%, #A8E3FF 100%)',
  vivid: 'linear-gradient(135deg, #8A5CF5 0%, #E3D9FF 100%)',
  clean: 'linear-gradient(135deg, #12B7F5 0%, #EAF4FB 100%)',
  green: 'linear-gradient(135deg, #95EC69 0%, #E4F7D6 100%)',
  black: 'linear-gradient(135deg, #0B0F16 0%, #1D2937 100%)',
}

/** 行容器/标题:与宿主 AppearanceRow/LanguageRow 的 group+title 一致。 */
const groupStyle = {
  display: 'flex', flexDirection: 'column', gap: '8px',
  padding: '16px 0', borderBottom: '1px solid var(--dsw-alias-border-l2)',
} satisfies CSSProperties

const titleStyle = {
  fontSize: '14px', fontWeight: 400, lineHeight: '22px',
  color: 'var(--dsw-alias-label-primary)',
} satisfies CSSProperties

/** 色板卡片行:flex 换行,与 AppearanceRow 的 cubeRow 同构。 */
const cardRowStyle = {
  display: 'flex', gap: '8px', flexWrap: 'wrap',
} satisfies CSSProperties

/** 标题+控件行(开关/宽度):左标题右控件,对齐 LanguageRow。 */
const fieldRowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '8px',
} satisfies CSSProperties

/** 开关网格:2 列紧凑布局,4 个开关占两行而非四行,节省垂直空间。 */
const toggleGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4px 16px',
} satisfies CSSProperties

const fieldLabelStyle = {
  fontSize: '14px', lineHeight: '22px',
  color: 'var(--dsw-alias-label-primary)',
} satisfies CSSProperties

/** QQ NT 风格 switch 轨道(选中品牌色,未选平台底色 + 细描边)。 */
const switchTrack = (checked: boolean): CSSProperties => ({
  flex: 'none',
  width: '36px', height: '20px',
  padding: 0,
  border: 'none',
  borderRadius: '999px',
  background: checked
    ? 'var(--dsw-alias-brand-primary)'
    : 'var(--dsw-alias-bg-module-platform)',
  boxShadow: checked ? 'none' : 'inset 0 0 0 1px var(--dsw-alias-border-l3)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'background 0.15s ease',
})

const switchThumb = (checked: boolean): CSSProperties => ({
  position: 'absolute',
  top: '2px',
  left: checked ? '18px' : '2px',
  width: '16px', height: '16px',
  borderRadius: '50%',
  background: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  transition: 'left 0.15s ease',
})

/** 单个色板卡片:渐变色块在上、文案在下,与 AppearanceRow 的 cube 同款。 */
function PaletteCard({ palette, label, selected, onSelect }: {
  palette: QQSkinPalette
  label: string
  selected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => { setHovered(true) }}
      onMouseLeave={() => { setHovered(false) }}
      style={{
        boxSizing: 'border-box',
        flex: '1 1 104px',
        minWidth: '104px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '6px',
        padding: '12px 8px',
        border: `1px solid ${selected ? 'var(--dsw-static-neutral-bluish-400)' : 'var(--dsw-alias-border-l2)'}`,
        borderRadius: '16px',
        background: selected
          ? 'var(--dsw-alias-bg-module-platform)'
          : hovered ? 'var(--dsw-alias-interactive-bg-hover)' : 'transparent',
        font: 'inherit',
        fontSize: '13px', lineHeight: '20px',
        color: 'var(--dsw-alias-label-primary)',
        cursor: 'pointer',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <span style={{
        width: '28px', height: '28px', borderRadius: '10px',
        background: PALETTE_PREVIEW[palette],
        border: '1px solid var(--dsw-alias-border-l2)',
      }} />
      {label}
    </button>
  )
}

/** 开关行:左标题右 switch(QQ NT 观感,role=switch 保可访问性)。 */
function ToggleRow({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div style={fieldRowStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => { onChange(!checked) }}
        style={switchTrack(checked)}
      >
        <span style={switchThumb(checked)} />
      </button>
    </div>
  )
}

/**
 * 渲染 QQ 皮肤设置行。
 * @param props - 组合后的槽位 props。
 * @returns 行元素树。
 */
export function QQSkinSettingsRow({
  t, useStore, setPalette, setBubbleTail, setAssistantAvatar, setChatMaxWidth,
  setMessageSound, setTyping,
}: QQSkinRowComponentProps) {
  const config = useStore(s => s.config)
  const [widthDraft, setWidthDraft] = useState(String(config.chatMaxWidth))
  const [widthFocused, setWidthFocused] = useState(false)

  const commitWidth = (): void => {
    const parsed = Number(widthDraft)
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== config.chatMaxWidth) {
      setChatMaxWidth(parsed)
    } else {
      setWidthDraft(String(config.chatMaxWidth))
    }
  }

  return (
    <div style={groupStyle}>
      <div style={titleStyle}>{t('row.title')}</div>

      {/* 色板:五选一卡片(渐变色块 + 文案,选中描边对齐宿主 cube) */}
      <div role="radiogroup" style={cardRowStyle}>
        {QQ_SKIN_PALETTES.map(palette => (
          <PaletteCard
            key={palette}
            palette={palette}
            label={t(PALETTE_LABEL_KEYS[palette])}
            selected={config.palette === palette}
            onSelect={() => { setPalette(palette) }}
          />
        ))}
      </div>

      {/* 开关网格:2×2 紧凑布局(气泡尾巴 / 企鹅头像 / 消息提示音 / 打字机) */}
      <div style={toggleGridStyle}>
        <ToggleRow
          label={t('row.bubbleTail')}
          checked={config.bubbleTail}
          onChange={setBubbleTail}
        />
        <ToggleRow
          label={t('row.assistantAvatar')}
          checked={config.assistantAvatar}
          onChange={setAssistantAvatar}
        />
        <ToggleRow
          label={t('row.messageSound')}
          checked={config.messageSound}
          onChange={setMessageSound}
        />
        <ToggleRow
          label={t('row.typing')}
          checked={config.typing}
          onChange={setTyping}
        />
      </div>

      {/* 会话宽度:暂存草稿,失焦/回车提交(与插件卡片相同的 staged 哲学) */}
      <div style={fieldRowStyle}>
        <span style={fieldLabelStyle}>{t('row.chatMaxWidth')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number"
            min={480}
            max={1600}
            value={widthDraft}
            onChange={event => { setWidthDraft(event.currentTarget.value) }}
            onFocus={() => { setWidthFocused(true) }}
            onBlur={() => { setWidthFocused(false); commitWidth() }}
            onKeyDown={event => { if (event.key === 'Enter') commitWidth() }}
            style={{
              width: '96px', height: '32px', padding: '0 10px',
              boxSizing: 'border-box',
              border: `1px solid ${widthFocused ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)'}`,
              borderRadius: '10px',
              background: 'var(--dsw-specific-input-major)',
              color: 'var(--dsw-alias-label-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--dsw-alias-label-caption)' }}>px</span>
        </span>
      </div>
    </div>
  )
}
