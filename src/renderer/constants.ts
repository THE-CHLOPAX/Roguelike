export const COLORS = {
  // Base
  GOLDEN: '#fffd88',
  DARK_KHAKI: '#393424',
  SOFT_FAWN: '#deba6f',
  BLACK: '#000',
  // Semantic
  BG_COLOR: '#191611',
  BG_COLOR_HIGHLIGHTED_HALF: '#211a0e',
  BG_COLOR_HIGHLIGHTED: '#312a1f',
  // Fonts
  FONT_COLOR_PRIMARY: '#e0d2b7',
  FONT_COLOR_HIGHLIGHT: '#ffdf9e',
  FONT_COLOR_DIMMED: '#7d6445',
} as const;

export const GRADIENTS = {
  BACKGROUND:
    `radial-gradient(ellipse at center, ${COLORS.BG_COLOR_HIGHLIGHTED_HALF} 0%, ` +
    `${COLORS.BG_COLOR} 100%)`,
} as const;
