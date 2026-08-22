/**
 * QQ 经典蓝皮肤 token 覆盖层（light/dark 双色值）。
 *
 * 每个条目覆盖一个 `--dsw-*` 语义 token：`light` 在浅色基座上生效，
 * `dark` 在深色基座上生效（`body[data-ds-dark-theme]`）。皮肤通过
 * `ctx.theme.overrideTokens('dsh-qq-skin', QQ_TOKEN_OVERRIDES)` 叠加，
 * 移除即还原；不在此清单中的 token 保持产品默认。
 *
 * 亮暗统一为 **QQ NT 语言**：亮色白净克制（表面近白、边框/hover 中性，
 * 品牌蓝 #12B7F5 与浅蓝气泡 #A8E3FF 只做辨识度点缀）；暗色沉稳蓝灰
 * （基座 #101822，降饱和，蓝同样只点缀）。配合 QQ 绿 #07C160 /
 * 红 #FA5151 / 琥珀 #FFC300 状态色。几何与结构（圆角、头像、气泡尾巴、
 * 输入区胶囊）由 qq-layout.ts 负责。
 */
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'

/** overrideTokens 层来源标识（即本插件包名）。 */
export const QQ_SKIN_SOURCE = 'dsh-qq-skin'

/** QQ NT 皮肤覆盖的语义 token 全集（亮/暗双色值）。 */
export const QQ_TOKEN_OVERRIDES: ThemeTokenOverrides = {
  // ── 品牌（亮暗同源，蓝色只做点缀） ──────────────────────────────────────
  '--dsw-alias-brand-primary': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-alias-brand-primary-invert': { light: '#FFFFFF', dark: '#101822' },
  '--dsw-alias-brand-primary-new-colorprimary-new-color': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-alias-brand-text': { light: '#0A8FD9', dark: '#7CD4FF' },
  '--dsw-alias-state-business-primary': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-alias-state-business-tertiary': { light: '#E8F4FB', dark: '#1E2A38' },
  '--dsw-alias-button-info-fill': { light: '#12B7F5', dark: '#2AA8E8' },
  '--dsw-alias-button-info-hover': { light: '#0FA3DC', dark: '#4CB8FF' },

  // ── 背景层级（亮色白净 / 暗色沉稳蓝灰） ─────────────────────────────
  '--dsw-alias-bg-base': { light: '#F7F9FB', dark: '#101822' },
  '--dsw-alias-bg-layer-1': { light: '#FFFFFF', dark: '#18222E' },
  '--dsw-alias-bg-layer-2': { light: '#FAFBFC', dark: '#1D2937' },
  '--dsw-alias-bg-layer-3': { light: '#F1F4F7', dark: '#243244' },
  '--dsw-alias-bg-overlay': { light: '#FFFFFF', dark: '#1D2937' },
  '--dsw-alias-bg-module-platform': { light: '#F2F5F8', dark: '#141E2A' },
  '--dsw-alias-bg-multi-select': { light: '#EDF1F5', dark: '#243244' },
  '--dsw-alias-bg-skeleton': { light: 'rgba(15, 23, 42, 0.06)', dark: 'rgba(148, 163, 184, 0.08)' },
  '--dsw-alias-bg-mask-drop': { light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(6, 10, 16, 0.72)' },
  // 遮罩层保持产品默认（黑色半透明，非蓝色系），仅纳入覆盖集保证完整。
  '--dsw-alias-bg-mask-1': { light: 'rgba(0, 0, 0, 0.24)', dark: 'rgba(0, 0, 0, 0.5)' },
  '--dsw-alias-bg-mask-2': { light: 'rgba(0, 0, 0, 0.12)', dark: 'rgba(0, 0, 0, 0.2)' },
  '--dsw-alias-bg-mask-3': { light: 'rgba(0, 0, 0, 0.48)', dark: 'rgba(0, 0, 0, 0.48)' },
  '--dsw-alias-bg-mask-photo': { light: 'rgba(0, 0, 0, 0.88)', dark: 'rgba(0, 0, 0, 0.88)' },

  // ── 边框（亮色中性细分割 / 暗色中性弱分割） ─────────────────────────────
  '--dsw-alias-border-l1': { light: 'rgba(15, 23, 42, 0.08)', dark: 'rgba(255, 255, 255, 0.08)' },
  '--dsw-alias-border-l2': { light: 'rgba(15, 23, 42, 0.12)', dark: 'rgba(255, 255, 255, 0.12)' },
  '--dsw-alias-border-l2-darkmode-thin': { light: 'rgba(15, 23, 42, 0.08)', dark: 'rgba(255, 255, 255, 0.08)' },
  '--dsw-alias-border-l3': { light: 'rgba(15, 23, 42, 0.16)', dark: 'rgba(255, 255, 255, 0.16)' },
  '--dsw-alias-border-l4': { light: 'rgba(15, 23, 42, 0.20)', dark: 'rgba(255, 255, 255, 0.20)' },
  '--dsw-alias-border-inverted': { light: 'rgba(255, 255, 255, 0.10)', dark: 'rgba(18, 122, 175, 0.20)' },
  '--dsw-alias-border-inverted2': { light: 'rgba(255, 255, 255, 0.12)', dark: 'rgba(18, 122, 175, 0.26)' },

  // ── 文字 ─────────────────────────────────────────────────────────────
  '--dsw-alias-label-primary': { light: '#1F2A35', dark: '#E6EDF4' },
  '--dsw-alias-label-primary-bluish': { light: '#0A6FB8', dark: '#8ED4FF' },
  '--dsw-alias-label-primary-dimmed': { light: '#3A4A59', dark: '#C3D0DE' },
  '--dsw-alias-label-primary-foreground': { light: '#FFFFFF', dark: '#101822' },
  '--dsw-alias-label-primary-inverted': { light: '#FFFFFF', dark: '#1B2632' },
  '--dsw-alias-label-secondary': { light: '#5A6B7A', dark: '#9FB4C6' },
  '--dsw-alias-label-tertiary': { light: '#7A8A97', dark: '#7E93A5' },
  '--dsw-alias-label-caption': { light: '#96A5B1', dark: '#5E7286' },
  '--dsw-alias-label-dimmed': { light: '#B4C0C9', dark: '#46586A' },

  // ── 交互 hover/active（亮色中性 / 暗色中性，选中态保留一点蓝） ──────────
  '--dsw-alias-interactive-bg-hover': { light: 'rgba(15, 23, 42, 0.05)', dark: 'rgba(255, 255, 255, 0.08)' },
  '--dsw-alias-interactive-bg-active': { light: 'rgba(15, 23, 42, 0.09)', dark: 'rgba(255, 255, 255, 0.14)' },
  '--dsw-alias-interactive-bg-hover-accent': { light: 'rgba(18, 183, 245, 0.10)', dark: 'rgba(255, 255, 255, 0.20)' },
  '--dsw-alias-interactive-bg-hover-solid': { light: '#F1F4F7', dark: '#243244' },
  '--dsw-alias-interactive-bg-hover-danger': { light: 'rgba(250, 81, 81, 0.06)', dark: 'rgba(250, 81, 81, 0.12)' },

  // ── 按钮（QQ 蓝主操作，蓝色仅点缀主按钮/选中态） ────────────────────────
  '--dsw-alias-button-primary-fill': { light: '#12B7F5', dark: '#2AA8E8' },
  '--dsw-alias-button-primary-hover': { light: '#0FA3DC', dark: '#4CB8FF' },
  '--dsw-alias-button-primary-dimmed': { light: '#BFE9FB', dark: '#1C3040' },
  '--dsw-alias-button-elevated-fill': { light: '#FFFFFF', dark: '#243244' },
  '--dsw-alias-button-floating-fill': { light: '#FFFFFF', dark: '#1D2937' },
  '--dsw-alias-button-floating-hover': { light: '#F1F4F7', dark: '#243244' },
  '--dsw-alias-button-contrast-fill': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-alias-button-ghost-active-fill': { light: '#E8F4FB', dark: '#243244' },
  '--dsw-alias-button-ghost-active-hover': { light: '#D9EDF9', dark: '#2A3A4C' },
  '--dsw-alias-button-ghost-active-border': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-alias-button-tool-bar-fill': { light: 'rgba(15, 23, 42, 0.28)', dark: 'rgba(76, 184, 255, 0.45)' },
  '--dsw-alias-button-tool-bar-fill-invisible': { light: 'rgba(15, 23, 42, 0.18)', dark: 'rgba(76, 184, 255, 0.30)' },
  '--dsw-alias-button-tool-bar-hover': { light: 'rgba(15, 23, 42, 0.36)', dark: 'rgba(76, 184, 255, 0.55)' },

  // ── 状态色（QQ 绿/红/琥珀） ──────────────────────────────────────────────
  '--dsw-alias-state-success-primary': { light: '#07C160', dark: '#2FD57F' },
  '--dsw-alias-state-success-secondary': { light: '#3CD98C', dark: '#3CD98C' },
  '--dsw-alias-state-success-tertiary': { light: '#E0F8EC', dark: '#14352A' },
  '--dsw-alias-state-error-primary': { light: '#FA5151', dark: '#FF6B6B' },
  '--dsw-alias-state-error-secondary': { light: '#FF8080', dark: '#E04848' },
  '--dsw-alias-state-warn-primary': { light: '#FFC300', dark: '#FFCC33' },
  '--dsw-alias-state-warn-secondary': { light: '#FFD84D', dark: '#C99A00' },
  '--dsw-alias-state-warn-tertiary': { light: '#FFF4CC', dark: '#3A2F0A' },
  '--dsw-alias-state-warn-label': { light: '#B8860B', dark: '#FFCC33' },

  // ── Markdown 渲染（亮色中性 / 暗色蓝灰） ─────────────────────────────────
  '--dsw-alias-markdown-inline-code': { light: '#EEF1F5', dark: '#1E2A38' },
  '--dsw-alias-markdown-code-block': { light: '#F6F8FA', dark: '#0E1622' },
  '--dsw-alias-markdown-code-block-banner': { light: '#F1F4F7', dark: '#1A2634' },
  '--dsw-alias-markdown-code-segment-selected': { light: '#FFFFFF', dark: '#243244' },
  '--dsw-alias-markdown-code-segment-unselected': { light: '#F1F4F7', dark: '#18222E' },
  '--dsw-alias-markdown-citation': { light: '#EEF1F5', dark: '#1E2A38' },
  '--dsw-alias-markdown-tag': { light: '#EEF1F5', dark: '#1E2A38' },
  '--dsw-alias-markdown-placeholder': { light: '#F1F4F7', dark: '#18222E' },

  // ── 浮层与提示（亮暗都保持深底，文字用浅色，避免暗色下发白） ────────────
  '--dsw-alias-toast-bg': { light: '#1B2A38', dark: '#1B2634' },
  '--dsw-alias-tooltip-bg': { light: '#20364F', dark: '#1B2634' },

  // ── 滚动条（亮色中性灰 / 暗色蓝灰） ──────────────────────────────────────
  '--dsw-alias-scrollbar-bg-l1': { light: '#D9DFE6', dark: '#2A3646' },
  '--dsw-alias-scrollbar-bg-l2': { light: '#D9DFE6', dark: '#2A3646' },
  '--dsw-alias-scrollbar-hover-l1': { light: '#B4BEC8', dark: '#3A4A5C' },
  '--dsw-alias-scrollbar-hover-l2': { light: '#B4BEC8', dark: '#3A4A5C' },

  // ── 会话专属（浅蓝气泡为 QQ 辨识度点缀） ─────────────────────────────────
  '--dsw-specific-bubble': { light: '#A8E3FF', dark: '#1D4E6E' },
  '--dsw-specific-bubble-highlight': { light: '#7CD4FF', dark: '#2A6A92' },
  '--dsw-specific-input-major': { light: '#FFFFFF', dark: '#18222E' },
  '--dsw-specific-login-input': { light: '#FFFFFF', dark: '#18222E' },
  '--dsw-specific-menu': { light: '#FFFFFF', dark: '#1D2937' },
  '--dsw-specific-selector': { light: '#F1F4F7', dark: '#18222E' },
  '--dsw-specific-tip': { light: '#F1F4F7', dark: '#18222E' },

  // ── 侧边栏（亮色白净 / 暗色蓝灰，选中项蓝 accent 点缀） ──────────────────
  '--dsw-specific-sidebar-fill': { light: '#F2F5F8', dark: '#0D141D' },
  '--dsw-specific-sidebar-nav-item-active': { light: '#FFFFFF', dark: '#1D2937' },
  '--dsw-specific-sidebar-nav-item-active-accent': { light: '#12B7F5', dark: '#4CB8FF' },
  '--dsw-specific-sidebar-nav-item-hover': { light: '#E9EEF3', dark: '#1A2634' },

  // ── 静态色板（组件直引，统一为 QQ 天蓝刻度） ─────────────────────────────
  // 部分组件（ChatView 渐变、StateDot、TrajectoryTable、ContextMeter 等）
  // 直接引用 --dsw-static-* 常量而非 alias token，默认值是 deepseek 蓝紫
  // #416EE6。这里把 deepseek/blue 两条蓝色刻度整体重映射为基于 #12B7F5
  // 的 QQ 天蓝刻度，使全界面蓝色统一（亮暗同值，与设计平台一致）。
  '--dsw-static-deepseek-50': { light: '#F0FAFF', dark: '#F0FAFF' },
  '--dsw-static-deepseek-100': { light: '#D6F0FD', dark: '#D6F0FD' },
  '--dsw-static-deepseek-200': { light: '#B2E4FC', dark: '#B2E4FC' },
  '--dsw-static-deepseek-300': { light: '#84D4F9', dark: '#84D4F9' },
  '--dsw-static-deepseek-400': { light: '#50C6F7', dark: '#50C6F7' },
  '--dsw-static-deepseek-450': { light: '#31BEF6', dark: '#31BEF6' },
  '--dsw-static-deepseek-500': { light: '#12B7F5', dark: '#12B7F5' },
  '--dsw-static-deepseek-600': { light: '#0D9BD1', dark: '#0D9BD1' },
  '--dsw-static-deepseek-700-delete': { light: '#0A7EAA', dark: '#0A7EAA' },
  '--dsw-static-deepseek-800': { light: '#09658A', dark: '#09658A' },
  '--dsw-static-deepseek-900': { light: '#074B67', dark: '#074B67' },
  '--dsw-static-blue-50': { light: '#F0FAFF', dark: '#F0FAFF' },
  '--dsw-static-blue-50p': { light: '#EAF8FF', dark: '#EAF8FF' },
  '--dsw-static-blue-75': { light: '#E6F5FE', dark: '#E6F5FE' },
  '--dsw-static-blue-100': { light: '#D6F0FD', dark: '#D6F0FD' },
  '--dsw-static-blue-300': { light: '#84D4F9', dark: '#84D4F9' },
  '--dsw-static-blue-400': { light: '#50C6F7', dark: '#50C6F7' },
  '--dsw-static-blue-450': { light: '#31BEF6', dark: '#31BEF6' },
  '--dsw-static-blue-500': { light: '#12B7F5', dark: '#12B7F5' },
  '--dsw-static-blue-600': { light: '#0D9BD1', dark: '#0D9BD1' },
  '--dsw-static-blue-800': { light: '#09658A', dark: '#09658A' },
  '--dsw-static-blue-900': { light: '#074B67', dark: '#074B67' },
  '--dsw-static-blue-950': { light: '#05374B', dark: '#05374B' },
}
