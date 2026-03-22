import { Request, Response } from 'express'
import { supabase } from '../supabase'
import { sendAiSensyCampaign } from '../services/aisensy.service'

// Create a new webinar registration (public endpoint), avoid duplicate per (email, webinar_slug)
export const createWebinarRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      phone,
      webinar_slug,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      notes,
    } = req.body ?? {}

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: 'name and email are required fields' })
    }
    if (!webinar_slug) {
      return res.status(400).json({ error: 'webinar_slug is required' })
    }

    const isPortfolioRedFlags =
      (source ?? '') === 'portfolio-red-flags-landing' ||
      String(webinar_slug || '').startsWith('portfolio-red-flags')

    if (isPortfolioRedFlags && !String(phone || '').trim()) {
      return res.status(400).json({
        error:
          'phone is required to send WhatsApp updates for this webinar registration',
      })
    }

    // Check for duplicate registration by email and webinar_slug
    const { data: existing, error: findError } = await supabase
      .from('webinar_registrations')
      .select('*')
      .eq('email', email)
      .eq('webinar_slug', webinar_slug)
      .maybeSingle()

    if (findError) {
      return res.status(500).json({ error: findError.message })
    }

    if (existing) {
      return res.status(409).json({
        error:
          'Duplicate registration: already registered for this webinar with this email.',
        registration: existing,
      })
    }

    // Insert if not duplicate
    const { data, error } = await supabase
      .from('webinar_registrations')
      .insert({
        name,
        email,
        phone: phone ?? null,
        webinar_slug: webinar_slug ?? null,
        source: source ?? 'portfolio-red-flags-landing',
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        notes: notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      // If the constraint was violated (shouldn't happen due to pre-check)
      if (
        error.code === '23505' &&
        (error.message || '').toLowerCase().includes('unique') &&
        (error.message || '').includes('unique_email_per_webinar')
      ) {
        return res.status(409).json({
          error:
            'Duplicate registration: already registered for this webinar with this email.',
        })
      }
      return res.status(500).json({ error: error.message })
    }

    // Trigger WhatsApp notification via AiSensy (best-effort; never blocks registration)
    if (isPortfolioRedFlags && phone) {
      void sendAiSensyCampaign({
        destination: String(phone),
        userName: String(name),
        source: source ?? 'portfolio-red-flags-landing',
        templateParams: [
          String(name),
          String(email),
          String(phone),
          String(webinar_slug || ''),
        ],
        attributes: {
          ...(email ? { email: String(email) } : {}),
          ...(webinar_slug ? { webinar_slug: String(webinar_slug) } : {}),
        },
      }).catch((e: any) => {
        console.error('AiSensy campaign send failed:', e?.message || e)
      })
    }

    return res.status(201).json(data)
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to register' })
  }
}

// List webinar registrations (admin)
export const listWebinarRegistrations = async (
  _req: Request,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from('webinar_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data ?? [])
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || 'Failed to load registrations' })
  }
}

// Delete a webinar registration (admin)
export const deleteWebinarRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    const { data, error } = await supabase
      .from('webinar_registrations')
      .delete()
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Registration not found' })
    }

    return res
      .status(200)
      .json({ message: 'Registration deleted.', registration: data })
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || 'Failed to delete registration' })
  }
}
