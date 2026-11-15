export const REMINDER_STAGES = {
  one_week_before: { dayDiff: 7, reminderLabel: '1 week before subscription expiry', campaignName: 'Bastion CORE Renewal Reminder #1' },
  expiry_day: { dayDiff: 0, reminderLabel: 'subscription expiry day', campaignName: 'Bastion CORE Renewal Reminder #2' },
  one_week_after: { dayDiff: -7, reminderLabel: '1 week after subscription expiry', campaignName: 'Bastion CORE Renewal Reminder #3' },
  fifteen_days_after: { dayDiff: -15, reminderLabel: '15 days after subscription expiry', campaignName: 'Bastion CORE Renewal Reminder #4' },
} as const;
export type SubscriptionReminderType = keyof typeof REMINDER_STAGES;
export type ReminderCampaign = {
  enabled: boolean;
  campaignName: string;
  templateParams: string[];
  mediaUrl: string;
  mediaFilename: string;
};
export type ReminderCampaigns = Record<SubscriptionReminderType, ReminderCampaign>;
export const REMINDER_VARIABLES = ['name', 'first_name', 'last_name', 'email', 'phone', 'expiry_date', 'plan_name', 'reminder_label'] as const;
export class ReminderSettingsError extends Error {}
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

export function resolveReminderCampaigns(value?: unknown): ReminderCampaigns {
  if (value !== undefined && !isObject(value)) throw new ReminderSettingsError('Reminder settings must be an object');
  const raw = (value || {}) as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!Object.prototype.hasOwnProperty.call(REMINDER_STAGES, key)) throw new ReminderSettingsError(`Unknown reminder stage: ${key}`);
  }
  const result = {} as ReminderCampaigns;
  for (const type of Object.keys(REMINDER_STAGES) as SubscriptionReminderType[]) {
    if (raw[type] !== undefined && !isObject(raw[type])) throw new ReminderSettingsError(`Invalid settings for ${type}`);
    const defaults: ReminderCampaign = { enabled: true, campaignName: REMINDER_STAGES[type].campaignName, templateParams: [],
      mediaUrl: type === 'one_week_before' || type === 'one_week_after' ? 'https://bastionresearch.in/media/Bastion-Logo.png' : '', mediaFilename: 'Bastion-Logo.png' };
    const setting = { ...defaults, ...(raw[type] as object || {}) } as ReminderCampaign;
    if (typeof setting.enabled !== 'boolean') throw new ReminderSettingsError(`Invalid enabled flag for ${type}`);
    if (typeof setting.campaignName !== 'string' || setting.campaignName.length > 200 || (setting.enabled && !setting.campaignName.trim())) throw new ReminderSettingsError(`Enter a campaign name for ${type}`);
    setting.campaignName = setting.campaignName.trim();
    if (!Array.isArray(setting.templateParams) || setting.templateParams.length > 20) throw new ReminderSettingsError(`Use at most 20 variables for ${type}`);
    for (const param of setting.templateParams) {
      if (typeof param !== 'string' || !param.trim() || param.length > 1000) throw new ReminderSettingsError(`Invalid variable value for ${type}`);
      const remainder = param.replace(/{{\s*([a-z_]+)\s*}}/g, (_, name) => {
        if (!(REMINDER_VARIABLES as readonly string[]).includes(name)) throw new ReminderSettingsError(`Unknown variable: ${name}`);
        return '';
      });
      if (remainder.includes('{{') || remainder.includes('}}')) throw new ReminderSettingsError(`Invalid variable syntax for ${type}`);
    }
    if (typeof setting.mediaUrl !== 'string' || typeof setting.mediaFilename !== 'string' || setting.mediaFilename.length > 200) throw new ReminderSettingsError(`Invalid media for ${type}`);
    setting.mediaUrl = setting.mediaUrl.trim();
    if (setting.mediaUrl) {
      try { if (new URL(setting.mediaUrl).protocol !== 'https:') throw new Error(); }
      catch { throw new ReminderSettingsError(`Use an HTTPS image URL for ${type}`); }
    }
    result[type] = { enabled: setting.enabled, campaignName: setting.campaignName,
      templateParams: [...setting.templateParams], mediaUrl: setting.mediaUrl, mediaFilename: setting.mediaFilename };

  }
  return result;
}

export function renderReminderVariables(params: string[], user: {
  first_name?: string | null; last_name?: string | null; username?: string | null;
  email?: string | null; phone?: string | null; subscription_end_date?: string | null;
  membership_plans?: { plan_name?: string | null } | null;
}, type: SubscriptionReminderType): string[] {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || 'User';
  const values: Record<string, string> = {
    name, first_name: user.first_name || name, last_name: user.last_name || '', email: user.email || 'N/A', phone: user.phone || '',
    expiry_date: String(user.subscription_end_date || '').slice(0, 10), plan_name: user.membership_plans?.plan_name || 'Bastion CORE', reminder_label: REMINDER_STAGES[type].reminderLabel,
  };
  return params.map(param => param.replace(/{{\s*([a-z_]+)\s*}}/g, (_, key) => values[key] ?? ''));
}
