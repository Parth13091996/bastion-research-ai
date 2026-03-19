type Tokens = typeof darkTokens
// ─── Types ────────────────────────────────────────────────────────────────────

type FlagStatus = 'flagged' | 'clear' | null
type FilterType = 'all' | 'critical' | 'high' | 'triggered'
type Theme = 'dark' | 'light'

type RedFlagCompany = {
  id: string
  name: string
  created_at?: string
}

type RedFlagCompanyStats = {
  company: RedFlagCompany
  usersFrequency: number
  flaggedQuestions: Array<{ key: string; count: number }>
}

interface ToggleButtonProps {
  label: string
  active: boolean
  activeStyle: React.CSSProperties
  t: Tokens
  onClick: () => void
}

interface Combo {
  id: number
  tier: 'critical' | 'high'
  flags: number[]
  name: string
  desc: string
  flagsLabel: string
  alert: string
  turnaround?: string
}

interface FlagCard {
  id: number
  num: string
  name: string
  desc: string
  check: string
}
