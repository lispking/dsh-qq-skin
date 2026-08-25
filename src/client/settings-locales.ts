/**
 * QQ 皮肤设置行的文案字典(zh/en 双语,注册进 locale 服务)。命名空间
 * 声明合并进 LocaleNamespaceMap,typed register 缺键/多键在编译期报错。
 */

/** 设置行命名空间(locale 字典与槽位 locale 座共用)。 */
export const QQ_SKIN_ROW_NS = 'dsh-qq-skin.settings'

/** 设置行文案键全集。 */
export type QQSkinSettingsKey =
  | 'row.title'
  | 'row.palette'
  | 'palette.classic'
  | 'palette.vivid'
  | 'palette.clean'
  | 'palette.green'
  | 'palette.black'
  | 'row.bubbleTail'
  | 'row.assistantAvatar'
  | 'row.chatMaxWidth'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** QQ 皮肤设置行的文案。 */
    'dsh-qq-skin.settings': QQSkinSettingsKey
  }
}

/** 中文文案。 */
export const zh: Record<QQSkinSettingsKey, string> = {
  'row.title': 'QQ 皮肤',
  'row.palette': '色板',
  'palette.classic': '经典蓝',
  'palette.vivid': '炫彩紫',
  'palette.clean': '简洁白',
  'palette.green': '经典绿气泡',
  'palette.black': '深空黑',
  'row.bubbleTail': '气泡尾巴',
  'row.assistantAvatar': '企鹅头像',
  'row.chatMaxWidth': '会话宽度',
}

/** 英文文案。 */
export const en: Record<QQSkinSettingsKey, string> = {
  'row.title': 'QQ Skin',
  'row.palette': 'Palette',
  'palette.classic': 'Classic Blue',
  'palette.vivid': 'Vivid Purple',
  'palette.clean': 'Clean White',
  'palette.green': 'Green Bubble',
  'palette.black': 'Deep Black',
  'row.bubbleTail': 'Bubble tail',
  'row.assistantAvatar': 'Penguin avatar',
  'row.chatMaxWidth': 'Chat width',
}
