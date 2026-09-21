/** AXIO Design System tokens from the Figma Make globals.css kit. */
export const AXIO = {
  background: '#FFFFFF',
  foreground: '#344054',
  card: '#FFFFFF',
  primary: '#074E9F',
  primaryForeground: '#F2F9FF',
  secondary: '#DEEDFE',
  muted: '#E9ECF1',
  mutedForeground: '#A6B0BF',
  accent: '#DEEDFE',
  accentForeground: '#074E9F',
  destructive: '#D92D20',
  border: '#A6B0BF',
  sidebarBorder: '#E4E7EC',
  info: '#0086C9',
  infoBackground: '#F2F6FA',
  success: '#07A721',
  radius: 8,
  radiusButton: 8,
  radiusCard: 8,
  navHeight: 64,
  sidebarExpanded: 264,
  sidebarCollapsed: 70,
  font: "'IBM Plex Sans Thai', 'IBM Plex Sans', sans-serif",
} as const

export const AXIO_CHART = {
  ink: AXIO.foreground,
  muted: AXIO.mutedForeground,
  grid: AXIO.sidebarBorder,
  tooltip: {
    background: AXIO.card,
    border: `1px solid ${AXIO.sidebarBorder}`,
    borderRadius: 8,
    fontFamily: AXIO.font,
    fontSize: 12,
    color: AXIO.foreground,
    boxShadow: '0px 2px 4px 0px rgba(10, 10, 16, 0.06)',
  },
} as const

export const AXIO_SERIES = [
  AXIO.primary,
  AXIO.info,
  AXIO.success,
  '#8A95A8',
  '#667085',
  '#0A5CAD',
  '#34B4E0',
  '#00964C',
  '#B3C4D9',
  AXIO.foreground,
]
