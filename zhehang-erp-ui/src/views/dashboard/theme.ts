// 驾驶舱设计器主题配置：黑金（默认）/ 浅色

// 黑金主题 (默认)
export const darkTheme = {
  // 背景
  canvasBg: '#0A0A0F',
  cardBg: '#12121A',
  cardBgHover: '#1A1A25',
  surfaceBg: '#16161F',

  // 金色系
  primary: '#D4AF37',
  primaryLight: 'rgba(212, 175, 55, 0.15)',
  primaryGradient: 'linear-gradient(135deg, #D4AF37, #F2D06B)',

  // 文字
  textPrimary: '#EAEAEA',
  textSecondary: '#8B8B9A',
  textMuted: '#5A5A6E',

  // 边框与阴影
  border: 'rgba(212, 175, 55, 0.15)',
  borderHover: 'rgba(212, 175, 55, 0.35)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 1px rgba(212, 175, 55, 0.1)',
  shadowHover: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 2px rgba(212, 175, 55, 0.2)',

  // 图表色序
  chartColors: ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF', '#FF6B6B', '#4ECDC4', '#C9B037'],

  // 功能色
  success: '#00D084',
  warning: '#FF9F43',
  danger: '#FF6B6B',
  info: '#5B8DEF',

  // 圆角
  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusLg: 16,

  // 间距
  spacingUnit: 8,
  gridGap: 16,
}

// 浅色主题
export const lightTheme = {
  canvasBg: '#F5F5F7',
  cardBg: '#FFFFFF',
  cardBgHover: '#FAFAFA',
  surfaceBg: '#F0F0F2',

  primary: '#D4AF37',
  primaryLight: 'rgba(212, 175, 55, 0.1)',
  primaryGradient: 'linear-gradient(135deg, #D4AF37, #F2D06B)',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B80',
  textMuted: '#9999AA',

  border: 'rgba(0, 0, 0, 0.08)',
  borderHover: 'rgba(212, 175, 55, 0.3)',
  shadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  shadowHover: '0 4px 20px rgba(0, 0, 0, 0.1)',

  chartColors: ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF', '#FF6B6B', '#4ECDC4', '#C9B037'],

  success: '#00D084',
  warning: '#FF9F43',
  danger: '#FF6B6B',
  info: '#5B8DEF',

  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusLg: 16,

  spacingUnit: 8,
  gridGap: 16,
}

export type ThemeConfig = typeof darkTheme
export type ThemeMode = 'dark' | 'light'

export function getTheme(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme
}
