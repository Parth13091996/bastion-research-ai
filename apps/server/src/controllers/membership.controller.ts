import { Request, Response } from 'express'
import { supabase } from '../supabase'
import { generateInvoicePdf } from '../services/invoice-pdf.service'

// Helper function to parse known Postgres constraint errors
function parseSupabaseError(error: any) {
  if (!error || !error.code) return error?.message || 'Unknown error'
  if (
    error.code === '23503' &&
    error.message &&
    error.message.includes('foreign key constraint')
  ) {
    // Foreign key violation, e.g. user_id does not exist in users
    if (error.message.includes('payment_history_user_id_fkey')) {
      return 'Invalid user_id. The user does not exist in the system.'
    }
    if (error.details) return error.details
    return error.message
  } else if (error.code === '23505') {
    // Unique constraint violated
    return 'Duplicate record. This item already exists.'
  }
  return error?.message || 'Database error'
}

type PaymentExtras = {
  discountedAmountByTransactionId: Map<string, number>
  couponCodeByTransactionId: Map<string, string>
}

async function fetchPaymentExtras(
  transactionIds: string[]
): Promise<PaymentExtras> {
  const discountedAmountByTransactionId = new Map<string, number>()
  const couponCodeByTransactionId = new Map<string, string>()

  const ids = (transactionIds || []).filter(Boolean)
  if (!ids.length)
    return { discountedAmountByTransactionId, couponCodeByTransactionId }

  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('transaction_id, discounted_amount, coupon_code, coupon_applied')
      .in('transaction_id', ids)

    if (error) throw error

    const rows = (data as any[]) || []
    const couponIds = Array.from(
      new Set(
        rows.map((r) => r?.coupon_applied).filter((x) => typeof x === 'number')
      )
    ) as number[]

    const couponCodeById = new Map<number, string>()
    if (couponIds.length) {
      const { data: couponRows, error: couponErr } = await supabase
        .from('coupons')
        .select('coupon_id, coupon_code')
        .in('coupon_id', couponIds)
      if (!couponErr) {
        ;((couponRows as any[]) || []).forEach((c) => {
          if (
            typeof c?.coupon_id === 'number' &&
            typeof c?.coupon_code === 'string'
          ) {
            couponCodeById.set(c.coupon_id, c.coupon_code)
          }
        })
      }
    }

    rows.forEach((r) => {
      const tx = r?.transaction_id ? String(r.transaction_id) : null
      if (!tx) return
      if (typeof r?.discounted_amount === 'number') {
        discountedAmountByTransactionId.set(tx, r.discounted_amount)
      }
      const directCode =
        typeof r?.coupon_code === 'string' && r.coupon_code.trim()
          ? r.coupon_code.trim()
          : null
      const fkCode =
        typeof r?.coupon_applied === 'number'
          ? couponCodeById.get(r.coupon_applied) || null
          : null
      const code = directCode || fkCode
      if (code) couponCodeByTransactionId.set(tx, code)
    })
  } catch {
    // Backward compatibility if new columns are not present yet.
  }

  return { discountedAmountByTransactionId, couponCodeByTransactionId }
}

export const getMembershipPlans = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .order('plan_id', { ascending: true })
  if (error) {
    return res.status(500).json({ error: parseSupabaseError(error) })
  }
  return res.status(200).json(data || [])
}

export const getSubscriptions = async (req: Request, res: Response) => {
  // Enrich subscription-like rows (derived from payment_history) with user and plan info for UI tables
  const { data, error } = await supabase
    .from('payment_history')
    .select(
      `
      user_id,
      plan_id,
      transaction_id,
      transaction_status,
      payer_email,
      created_at,
      users!payment_history_user_id_fkey ( id, first_name, last_name, email, role ),
      membership_plans!payment_history_plan_id_fkey ( plan_id, plan_name, currency, price_amount, plan_code, duration_months )
    `
    )
    .order('created_at', { ascending: false })
  if (error) {
    return res.status(500).json({ error: parseSupabaseError(error) })
  }

  const rows = (data as any[]) || []
  const extras = await fetchPaymentExtras(
    rows.map((r: any) => String(r?.transaction_id || '')).filter(Boolean)
  )
  // Map to include commonly used UI fields
  const mapped = rows.map((r: any) => {
    const user = r?.users || {}
    const plan = r?.membership_plans || {}

    const startDate = r.created_at ? new Date(r.created_at) : null
    let expireNextRenewal: string | null = null
    if (
      startDate &&
      typeof plan.duration_months === 'number' &&
      plan.duration_months > 0
    ) {
      const exp = new Date(startDate)
      exp.setMonth(exp.getMonth() + plan.duration_months)
      expireNextRenewal = exp.toISOString()
    }

    return {
      // original fields (aligned with previous subscriptions response)
      id: r.transaction_id,
      membership_id: r.plan_id,
      start_date: startDate ? startDate.toISOString() : null,
      expire_next_renewal: expireNextRenewal,
      amount:
        extras.discountedAmountByTransactionId.get(String(r.transaction_id)) ??
        plan.price_amount ??
        null,
      created_at: r.created_at,
      user_id: r.user_id,
      transaction_id: r.transaction_id,
      // enriched fields expected by admin UI
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
      currency: plan.currency || null,
      payment_type: 'Subscription',
      status: r.transaction_status || 'Active',
      user_email: user.email || null,
      user_role: user.role || null,
      membership_name: plan.plan_name || null,
      plan_code: plan.plan_code || null,
    }
  })
  return res.status(200).json(mapped)
}

export const getPaymentHistory = async (req: Request, res: Response) => {
  // Join with users and plans to provide full rows
  const { data, error } = await supabase
    .from('payment_history')
    .select(
      `
      transaction_id,
      payer_email,
      transaction_status,
      user_id,
      plan_id,
      created_at,
      users!payment_history_user_id_fkey ( id, email, first_name, last_name ),
      membership_plans!payment_history_plan_id_fkey ( plan_id, plan_name, price_amount, currency, plan_code )
    `
    )
    .order('created_at', { ascending: false })
  if (error) {
    return res.status(500).json({ error: parseSupabaseError(error) })
  }
  const rows = (data as any[]) || []
  const extras = await fetchPaymentExtras(
    rows.map((r: any) => String(r?.transaction_id || '')).filter(Boolean)
  )
  const mapped = rows.map((r: any) => {
    const user = r?.users || {}
    const plan = r?.membership_plans || {}
    const transactionId = String(r.transaction_id)
    const discountedAmount =
      extras.discountedAmountByTransactionId.get(transactionId) ??
      plan?.price_amount ??
      null
    return {
      transaction_id: r.transaction_id,
      invoice_id: r.transaction_id,
      user_id: r.user_id,
      user_email: user.email || null,
      membership:
        plan.plan_name || (plan.plan_id != null ? String(plan.plan_id) : null),
      payment_gateway: 'Cashfree',
      payment_type: 'Subscription',
      payer_email: r.payer_email || user.email || null,
      transaction_status: r.transaction_status || null,
      payment_date: r.created_at,
      amount: discountedAmount,
      currency: plan?.currency || 'INR',
      plan_id: r.plan_id,
      plan_code: plan?.plan_code || null,
      created_at: r.created_at,
      coupon_code: extras.couponCodeByTransactionId.get(transactionId) || null,
    }
  })
  return res.status(200).json(mapped)
}

export const getMyPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user
    if (!user?.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const { data, error } = await supabase
      .from('payment_history')
      .select(
        `
        transaction_id,
        payer_email,
        transaction_status,
        user_id,
        plan_id,
        created_at,
        membership_plans!payment_history_plan_id_fkey ( plan_name, price_amount, currency, plan_code )
      `
      )
      .eq('user_id', user.id as string)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: parseSupabaseError(error) })
    }

    const rows = (data as any[]) || []
    const extras = await fetchPaymentExtras(
      rows.map((r: any) => String(r?.transaction_id || '')).filter(Boolean)
    )
    const mapped = rows.map((r: any) => {
      const plan = r?.membership_plans || {}
      const transactionId = String(r.transaction_id)
      const discountedAmount =
        extras.discountedAmountByTransactionId.get(transactionId) ??
        plan?.price_amount ??
        null
      return {
        transaction_id: r.transaction_id,
        invoice_id: r.transaction_id,
        payment_gateway: 'Cashfree',
        payment_type: 'Subscription',
        payer_email: r.payer_email || null,
        transaction_status: r.transaction_status || null,
        user_id: r.user_id,
        plan_id: r.plan_id,
        payment_date: r.created_at,
        amount: discountedAmount,
        membership: plan?.plan_name || null,
        currency: plan?.currency || 'INR',
        plan_code: plan?.plan_code || null,
        coupon_code:
          extras.couponCodeByTransactionId.get(transactionId) || null,
      }
    })
    return res.status(200).json(mapped)
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' })
  }
}

export const getInvoicePdfForPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const currentUser: any = (req as any).user

    if (!id) {
      return res.status(400).json({ message: 'Transaction id is required' })
    }

    const { data, error } = await supabase
      .from('payment_history')
      .select(
        `
        transaction_id,
        payer_email,
        user_id,
        plan_id,
        created_at,
        membership_plans!payment_history_plan_id_fkey ( plan_name, price_amount, currency, plan_code ),
        users!payment_history_user_id_fkey ( first_name, last_name, email, phone, address_1, address_2, city, state, pin_code )
      `
      )
      .eq('transaction_id', id)
      .maybeSingle()

    if (error) {
      return res.status(500).json({ message: parseSupabaseError(error) })
    }
    if (!data) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (
      currentUser &&
      currentUser.role !== 'admin' &&
      currentUser.id !== data.user_id
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to access this invoice' })
    }

    const settingsRow = await supabase
      .from('settings')
      .select('data')
      .maybeSingle()
    if (settingsRow.error) {
      return res
        .status(500)
        .json({
          message: parseSupabaseError(settingsRow.error) || 'Settings error',
        })
    }
    const settingsData = (settingsRow.data?.data || {}) as {
      invoice_file_url?: string
    }

    if (!settingsData.invoice_file_url) {
      return res
        .status(400)
        .json({ message: 'Invoice template is not configured' })
    }

    const plan = (data as any).membership_plans || {}
    const user = (data as any).users || {}

    const invoiceNumber = data.transaction_id
    const paymentDate = data.created_at ? new Date(data.created_at) : new Date()
    const invoiceDateStr = paymentDate.toISOString().split('T')[0]

    const billToName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ')

    const addressParts = [
      user.address_1,
      user.address_2,
      user.city,
      user.state,
      user.pin_code,
      user.phone,
    ]
      .map((x: any) => (x == null ? '' : String(x)))
      .filter((x: string) => x.trim().length > 0)
    const fullAddress = addressParts.join(', ')

    const itemDescription =
      plan.plan_name || `Subscription Plan ${plan.plan_code || ''}`.trim()
    let amountNumber =
      typeof plan.price_amount === 'number' ? plan.price_amount : 0
    try {
      const extras = await fetchPaymentExtras([String(data.transaction_id)])
      const discounted = extras.discountedAmountByTransactionId.get(
        String(data.transaction_id)
      )
      if (typeof discounted === 'number') amountNumber = discounted
    } catch {
      // ignore
    }

    const pdfBytes = await generateInvoicePdf(settingsData.invoice_file_url, {
      invoiceNumber,
      invoiceDate: invoiceDateStr,
      dueDate: invoiceDateStr,
      billToName: billToName || user.email || data.payer_email || '',
      billToAddress: fullAddress,
      shipToName: billToName || user.email || data.payer_email || '',
      shipToAddress: fullAddress,
      itemDescription,
      quantity: 1,
      amount: amountNumber,
      total: amountNumber,
      balanceDue: 0,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename=\"invoice-${invoiceNumber}.pdf\"`
    )
    return res.send(Buffer.from(pdfBytes))
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || 'Failed to generate invoice PDF' })
  }
}

export const createMembershipPlan = async (req: Request, res: Response) => {
  const {
    plan_name,
    plan_type,
    members,
    price_amount,
    currency,
    duration_months,
  } = req.body

  // Prevent duplicate plan_name or (plan_name, plan_type) as needed
  try {
    // Change this logic if you want to allow certain duplicates
    const { data: existingPlan, error: findError } = await supabase
      .from('membership_plans')
      .select('plan_id')
      .eq('plan_name', plan_name)
      .maybeSingle()
    if (findError) {
      return res.status(500).json({ error: parseSupabaseError(findError) })
    }
    if (existingPlan) {
      return res
        .status(400)
        .json({ error: 'A membership plan with this name already exists.' })
    }

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([
        {
          plan_name,
          plan_type,
          members: members || 0,
          price_amount,
          currency,
          duration_months,
        },
      ])
      .select()
    if (error) return res.status(500).json({ error: parseSupabaseError(error) })
    res.status(201).json(data)
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || 'Failed to create membership plan' })
  }
}

export const updateMembershipPlan = async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    plan_name,
    plan_type,
    members,
    price_amount,
    currency,
    duration_months,
  } = req.body

  // Prevent duplicate name on update if necessary
  try {
    if (plan_name) {
      // Check if another plan already has this name
      const { data: existingPlan, error: findError } = await supabase
        .from('membership_plans')
        .select('plan_id')
        .eq('plan_name', plan_name)
        .neq('plan_id', id)
        .maybeSingle()
      if (findError) {
        return res.status(500).json({ error: parseSupabaseError(findError) })
      }
      if (existingPlan) {
        return res
          .status(400)
          .json({
            error: 'Another membership plan with this name already exists.',
          })
      }
    }

    const { data, error } = await supabase
      .from('membership_plans')
      .update({
        plan_name,
        plan_type,
        members,
        price_amount,
        currency,
        duration_months,
      })
      .eq('plan_id', id)
      .select()
    if (error) return res.status(500).json({ error: parseSupabaseError(error) })
    res.status(200).json(data)
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || 'Failed to update membership plan' })
  }
}

export const deleteMembershipPlan = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const { data, error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('plan_id', id)
      .select()
    if (error) return res.status(500).json({ error: parseSupabaseError(error) })
    res.status(200).json(data)
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || 'Failed to delete plan' })
  }
}

export const deletePaymentHistory = async (req: Request, res: Response) => {
  const { id } = req.params // transaction_id as identifier
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .delete()
      .eq('transaction_id', id)
      .select()
    if (error) return res.status(500).json({ error: parseSupabaseError(error) })
    res.status(200).json(data)
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || 'Failed to delete payment history' })
  }
}
