export type GradeType = 'kyu' | 'dan'

/** Step direction the (first) technique is performed in. */
export type StepDir = 'vor' | 'zurück' | 'seit'

/** A single numbered Kihon (Grundschule) line. */
export interface KihonItem {
  no: number
  /** Stance abbreviation as printed, e.g. "ZK", "KK", "Shizentai". */
  stance?: string
  /**
   * Step direction printed before the technique in the PDF:
   * ⇒ vorwärts, ⇐ rückwärts, ⇔ seitwärts. Omitted when performed on the spot.
   */
  dir?: StepDir
  /** The technique / combination description. */
  text: string
}

/** One row of a Tori/Uke Kumite table. */
export interface KumiteRow {
  /** e.g. "Ausgangsstellung", "Bewegung", "Ablauf". */
  aspect: string
  tori: string
  uke: string
}

export interface KumiteBlock {
  /** Named Kumite form, e.g. "Gohon-Kumite", "Jiyu-Ippon-Kumite". */
  form?: string
  rows?: KumiteRow[]
  /** Free note printed below the table. */
  note?: string
  /** Additional plain forms listed (e.g. "Jiyu-Kumite"). */
  extra?: string[]
}

export interface KataReq {
  /** Kyu grades: one or more required / selectable katas. */
  list?: string[]
  /** Prefix note for the list, e.g. "Wahl aus". */
  note?: string
  /** Dan grades: free Tokui Kata rule text. */
  tokui?: string
  /** Dan grades: Shitei Kata rule text. */
  shitei?: string
}

export interface Grade {
  id: string
  type: GradeType
  /** 9..1 for Kyu, 1..8 for Dan. */
  rank: number
  /** e.g. "9. Kyu", "1. Dan". */
  title: string
  /** Belt name, e.g. "Weißer Gürtel". */
  belt: string
  /** Hex color used for the belt swatch. */
  beltColor: string
  /** Whether the swatch needs a border (white belt). */
  beltOutline?: boolean
  /** Stage grouping, e.g. "Unterstufe", "Dan-Grade". */
  group: string
  kihon: KihonItem[]
  /** Free-text note for Kihon (e.g. Dan "nach Ansage" descriptions). */
  kihonNote?: string
  kata?: KataReq
  /** Anwendung / Bunkai requirements. */
  bunkai?: string
  kumite?: KumiteBlock
}

export interface GlossaryEntry {
  term: string
  meaning: string
  category: string
}

export interface InfoSection {
  id: string
  title: string
  /** Paragraphs of body text. */
  body?: string[]
  /** Bullet list items. */
  bullets?: string[]
  /** Key/value legend pairs. */
  legend?: [string, string][]
}
