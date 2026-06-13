import type { KihonItem, StepDir } from './types'

/** Direction of a single step within a combination. 'none' = ohne Schritt (/). */
export type StepDirOrNone = StepDir | 'none'

export interface KihonStep {
  dir: StepDirOrNone
  stance?: string
  /** Repetition count for the (sub-)combination this step starts, e.g. "5×". */
  count?: string
  text: string
}

/** A counted (sub-)group within a combination — one row in the Wdh. table. */
export interface KihonGroup {
  /** Repetition count, e.g. "2×". Undefined → the implicit default (5×). */
  count?: string
  steps: KihonStep[]
}

export interface ParsedKihon {
  steps: KihonStep[]
  /** Steps folded into counted groups (a new group starts at each step with a count). */
  groups: KihonGroup[]
  notes: string[]
}

/** Folds a flat step list into counted groups for the Wdh. column. */
export function groupSteps(steps: KihonStep[]): KihonGroup[] {
  const groups: KihonGroup[] = []
  for (const step of steps) {
    if (groups.length === 0 || step.count) {
      groups.push({ count: step.count, steps: [step] })
    } else {
      groups[groups.length - 1].steps.push(step)
    }
  }
  return groups
}

const STANCE_RE = /^(ZK|KK|KB|NA|SD|FD)\s+/
// A new counted sub-group, e.g. ", 2 × Soto-Uke" — but not ", 3× rechts".
const GROUP_SPLIT = /\s*[;,]\s*(?=\d+\s*×\s*[A-ZÄÖÜ])/

/**
 * Turns a Kihon combination's flat text into an explicit sequence of steps,
 * each carrying its own stance and step direction. The PDF encodes these with
 * a leading arrow (⇒/⇐/⇔, captured in `item.dir`) and the in-line separators
 * `/` (ohne Schritt), `v` (vorwärts) and `r` (rückwärts); stances change via
 * the abbreviations ZK/KK/KB/NA/SD/FD mid-combination.
 */
export function parseKihon(item: KihonItem): ParsedKihon {
  const notes: string[] = []
  let text = item.text.trim()

  // Mask parentheticals so separators inside them (e.g. "(… / …)") aren't split.
  const masks: string[] = []
  text = text.replace(/\([^()]*\)/g, (m) => {
    masks.push(m)
    return `${masks.length - 1}`
  })
  const unmask = (s: string) =>
    s.replace(/(\d+)/g, (_, i) => masks[+i])

  // Trailing em-dash clause → note.
  const dash = text.match(/\s+[—–-]\s+([\s\S]+?)\s*$/)
  if (dash) {
    notes.unshift(unmask(dash[1]).trim())
    text = text.slice(0, dash.index).trim()
  }
  // Trailing "(Wendung …)" → note.
  const tail = text.match(/\s*(\d+)\s*$/)
  if (tail && /^\(Wendung/i.test(masks[+tail[1]])) {
    notes.unshift(masks[+tail[1]].replace(/^\(|\)$/g, '').trim())
    text = text.slice(0, tail.index).trim()
  }

  // Split into segments on the in-line separators  /  v  r .
  const raw = text.split(/ (\/|v|r) /)
  const segs: { dir: StepDirOrNone; seg: string }[] = [
    { dir: item.dir ?? 'none', seg: raw[0] },
  ]
  for (let i = 1; i < raw.length; i += 2) {
    const sep = raw[i]
    const dir: StepDirOrNone = sep === '/' ? 'none' : sep === 'v' ? 'vor' : 'zurück'
    segs.push({ dir, seg: raw[i + 1] ?? '' })
  }

  const steps: KihonStep[] = []
  let prevStance = item.stance
  for (const { dir, seg } of segs) {
    const groups = seg.split(GROUP_SPLIT)
    groups.forEach((g, gi) => {
      let s = g.trim().replace(/[,;]\s*$/, '')
      const stepDir: StepDirOrNone = gi === 0 ? dir : item.dir ?? 'vor'

      let count: string | undefined
      const cm = s.match(/^(\d+)\s*×\s*/)
      if (cm) {
        count = `${cm[1]}×`
        s = s.slice(cm[0].length)
      }

      let stance = prevStance
      const sm = s.match(STANCE_RE)
      if (sm) {
        stance = sm[1]
        s = s.slice(sm[0].length)
        prevStance = stance
      }

      s = unmask(s).trim().replace(/^[,;]\s*/, '')
      if (s) steps.push({ dir: stepDir, stance, count, text: s })
    })
  }

  return { steps, groups: groupSteps(steps), notes }
}
