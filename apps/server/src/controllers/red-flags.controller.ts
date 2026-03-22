import { Request, Response } from 'express'
import { supabase } from '../supabase'

type AuthedRequest = Request & { user?: { id: string; role?: string } }

const COMPANIES_TABLE = 'red_flag_companies'
/** Supabase table name (typo preserved to match existing DB). */
const SUBMISSIONS_TABLE = 'red_flag_submissions'

const normalizeCompanyName = (name: unknown) =>
  typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''

const normalizeFlaggedKeys = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value
    .filter((k): k is string => typeof k === 'string')
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 200)
}

const normalizeLogoUrl = (value: unknown) => {
  if (typeof value !== 'string') return null
  const u = value.trim()
  if (!u) return null
  if (u.length > 2048) return null
  return u
}

export const listRedFlagCompanies = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(COMPANIES_TABLE)
      .select('id,name,logo_url,created_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data ?? [])
  } catch (error: any) {
    console.error('Error listing red-flag companies:', error)
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

export const submitRedFlagDecision = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    const companyId =
      typeof req.body?.companyId === 'string' ? req.body.companyId : ''
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' })
    }

    const flaggedKeys = normalizeFlaggedKeys(req.body?.flaggedKeys)

    const payload = {
      company_id: companyId,
      user_id: userId,
      flagged_keys: flaggedKeys,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .upsert([payload], { onConflict: 'company_id,user_id' })
      .select('id,company_id,user_id,flagged_keys,created_at,updated_at')
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
  submissions: Array<{ user_id: string; flagged_keys: string[] | null }>
) => {
  const userIds = new Set<string>()
  const flaggedCounts = new Map<string, number>()

  for (const s of submissions) {
    if (s.user_id) userIds.add(s.user_id)
    const keys = Array.isArray(s.flagged_keys) ? s.flagged_keys : []
    for (const k of keys) {
      const key = typeof k === 'string' ? k.trim() : ''
      if (!key) continue
      flaggedCounts.set(key, (flaggedCounts.get(key) ?? 0) + 1)
    }
  }

  return {
    usersFrequency: userIds.size,
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
        .select('user_id,flagged_keys')
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
      (submissions ?? []) as Array<{ user_id: string; flagged_keys: string[] }>
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
    const [
      { data: companies, error: companiesError },
      { data: submissions, error: submissionsError },
    ] = await Promise.all([
      supabase
        .from(COMPANIES_TABLE)
        .select('id,name,logo_url,created_at')
        .order('name', { ascending: true }),
      supabase
        .from(SUBMISSIONS_TABLE)
        .select('company_id,user_id,flagged_keys'),
    ])

    if (companiesError) {
      console.error('Database error:', companiesError)
      return res.status(500).json({ error: companiesError.message })
    }
    if (submissionsError) {
      console.error('Database error:', submissionsError)
      return res.status(500).json({ error: submissionsError.message })
    }

    const byCompany = new Map<
      string,
      Array<{ user_id: string; flagged_keys: string[] | null }>
    >()
    for (const s of (submissions ?? []) as Array<{
      company_id: string
      user_id: string
      flagged_keys: string[] | null
    }>) {
      if (!s.company_id) continue
      if (!byCompany.has(s.company_id)) byCompany.set(s.company_id, [])
      byCompany.get(s.company_id)!.push({
        user_id: s.user_id,
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
