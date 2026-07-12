import { Request, Response } from 'express'
import { supabase } from '../supabase'

const COMPANIES_TABLE = 'red_flag_companies'
/** Supabase table name (typo preserved to match existing DB). */
const SUBMISSIONS_TABLE = 'red_flag_submissions'

const normalizeCompanyName = (name: unknown) =>
  typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''

const normalizeFlaggedKeys = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  const normalized: string[] = []

  for (const entry of value) {
    if (typeof entry !== 'string') continue
    const key = entry.trim()
    if (!key) continue
    normalized.push(key)
    if (normalized.length >= 200) break
  }

  return normalized
}

const buildFlaggedKeysFrequencyMap = (
  keys: string[]
): Record<string, number> => {
  const frequencyMap: Record<string, number> = {}
  for (const key of keys) {
    frequencyMap[key] = (frequencyMap[key] ?? 0) + 1
  }
  return frequencyMap
}

const extractFlaggedKeysFrequencyMap = (
  value: unknown
): Record<string, number> => {
  // Accepts object in { key: number, ... } form; or fallback to old array style.
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const result: Record<string, number> = {}
    for (const [rawKey, rawValue] of Object.entries(value)) {
      const key = rawKey.trim()
      if (!key) continue
      if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) continue
      const count = Math.floor(rawValue)
      if (count <= 0) continue
      result[key] = count
    }
    return result
  }

  // Backward compatibility: old array-based storage (flat array or array of objects)
  if (Array.isArray(value)) {
    const fallbackMap: Record<string, number> = {}
    for (const item of value) {
      if (typeof item === 'string') {
        const key = item.trim()
        if (!key) continue
        fallbackMap[key] = (fallbackMap[key] ?? 0) + 1
      } else if (item && typeof item === 'object') {
        const key =
          typeof (item as { key?: unknown }).key === 'string'
            ? (item as { key: string }).key.trim()
            : ''
        if (!key) continue
        fallbackMap[key] = (fallbackMap[key] ?? 0) + 1
      }
    }
    return fallbackMap
  }

  return {}
}

const normalizeLogoUrl = (value: unknown) => {
  if (typeof value !== 'string') return null
  const u = value.trim()
  if (!u) return null
  if (u.length > 2048) return null
  return u
}

const fetchAllCompanies = async () => {
  let allData: any[] = []
  let from = 0
  const PAGE_SIZE = 1000

  while (true) {
    const { data, error } = await supabase
      .from(COMPANIES_TABLE)
      .select('id,name,logo_url,created_at')
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    allData = allData.concat(data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return allData
}

const fetchAllSubmissions = async () => {
  let allData: any[] = []
  let from = 0
  const PAGE_SIZE = 1000

  while (true) {
    const { data, error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .select('company_id,flagged_keys')
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    allData = allData.concat(data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return allData
}

export const listRedFlagCompanies = async (req: Request, res: Response) => {
  try {
    const data = await fetchAllCompanies()
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error listing red-flag companies:', error)
    return res.status(500).json({ error: error?.message || 'Internal server error' })
  }
}

export const deleteRedFlagCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    const { error } = await supabase
      .from(COMPANIES_TABLE)
      .delete()
      .eq('id', companyId)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(204).send() // No Content
  } catch (error: any) {
    console.error('Error deleting red-flag company:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const clearRedFlagSubmissions = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    const { error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .delete()
      .eq('company_id', companyId)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Analytics data cleared' })
  } catch (error: any) {
    console.error('Error clearing red-flag submissions:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const createRedFlagCompany = async (req: Request, res: Response) => {
  try {
    const name = normalizeCompanyName(req.body?.name)
    if (!name) {
      return res.status(400).json({ error: 'Company name is required' })
    }

    const logoUrl = normalizeLogoUrl(req.body?.logo_url)
    const row: { name: string; logo_url?: string | null } = { name }
    if (logoUrl) row.logo_url = logoUrl

    const { data, error } = await supabase
      .from(COMPANIES_TABLE)
      .insert([row])
      .select('id,name,logo_url,created_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data)
  } catch (error: any) {
    console.error('Error creating red-flag company:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateRedFlagCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    const name = normalizeCompanyName(req.body?.name)
    const logoUrl = normalizeLogoUrl(req.body?.logo_url)

    const updates: { name?: string; logo_url?: string | null } = {}
    if (name) updates.name = name
    if (req.body?.logo_url !== undefined) updates.logo_url = logoUrl

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field (name or logo_url) is required for update' })
    }

    const { data, error } = await supabase
      .from(COMPANIES_TABLE)
      .update(updates)
      .eq('id', companyId)
      .select('id,name,logo_url,created_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' })
      }
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error updating red-flag company:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * The payload for red-flag submissions is now stored per submission (per request).
 * Each submission builds its key frequency from that one payload only.
 * Multiple submissions for the same company_id will result in an array of submissions.
 */
export const submitRedFlagDecision = async (req: Request, res: Response) => {
  try {
    const companyId =
      typeof req.body?.companyId === 'string' ? req.body.companyId : ''
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    const flaggedKeys = normalizeFlaggedKeys(req.body?.flaggedKeys)
    const flaggedKeysFrequency = buildFlaggedKeysFrequencyMap(flaggedKeys)

    const payload = {
      company_id: companyId,
      flagged_keys: flaggedKeysFrequency,
      updated_at: new Date().toISOString(),
    }

    // Insert a new submission every time. Don't upsert; multiple users/attempts should yield multiple rows.
    const { data, error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .insert([payload])
      .select('id,company_id,flagged_keys,created_at,updated_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error submitting red-flag decision:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const computeStats = (
  submissions: Array<{
    flagged_keys: unknown
  }>
) => {
  const flaggedCounts = new Map<string, number>()

  for (const s of submissions) {
    const frequencyMap = extractFlaggedKeysFrequencyMap(s.flagged_keys)
    for (const [key, count] of Object.entries(frequencyMap)) {
      flaggedCounts.set(key, (flaggedCounts.get(key) ?? 0) + count)
    }
  }

  return {
    usersFrequency: submissions.length,
    flaggedQuestions: Array.from(flaggedCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
  }
}

export const getRedFlagCompanyStats = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params as { companyId?: string }
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    const [
      { data: company, error: companyError },
      { data: submissions, error: submissionsError },
    ] = await Promise.all([
      supabase
        .from(COMPANIES_TABLE)
        .select('id,name,logo_url,created_at')
        .eq('id', companyId)
        .single(),
      supabase
        .from(SUBMISSIONS_TABLE)
        .select('flagged_keys')
        .eq('company_id', companyId),
    ])

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' })
      }
      console.error('Database error:', companyError)
      return res.status(500).json({ error: companyError.message })
    }
    if (submissionsError) {
      console.error('Database error:', submissionsError)
      return res.status(500).json({ error: submissionsError.message })
    }

    const stats = computeStats(
      (submissions ?? []) as Array<{
        flagged_keys: unknown
      }>
    )

    return res.status(200).json({
      company,
      ...stats,
    })
  } catch (error: any) {
    console.error('Error fetching red-flag company stats:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllRedFlagCompanyStats = async (
  req: Request,
  res: Response
) => {
  try {
    const [companies, submissions] = await Promise.all([
      fetchAllCompanies(),
      fetchAllSubmissions(),
    ])

    const byCompany = new Map<
      string,
      Array<{
        flagged_keys: unknown
      }>
    >()
    for (const s of (submissions ?? []) as Array<{
      company_id: string
      flagged_keys: unknown
    }>) {
      if (!s.company_id) continue
      if (!byCompany.has(s.company_id)) byCompany.set(s.company_id, [])
      byCompany.get(s.company_id)!.push({
        flagged_keys: s.flagged_keys,
      })
    }

    const result = (companies ?? []).map((c: any) => {
      const stats = computeStats(byCompany.get(c.id) ?? [])
      return {
        company: c,
        ...stats,
      }
    })

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('Error fetching all red-flag company stats:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
