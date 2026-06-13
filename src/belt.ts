/**
 * Picks a readable ink color for text/icons drawn on top of a belt color.
 * Uses YIQ brightness; belts brighter than the threshold get dark ink, the
 * rest get white ink. The threshold (130) keeps white, yellow and orange on
 * dark ink — white-on-orange is too low-contrast — while green and darker
 * belts use white ink.
 */
export function beltContrast(hex: string): { fg: string; isLight: boolean } {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const isLight = brightness > 130
  return { fg: isLight ? '#1f2937' : '#ffffff', isLight }
}
