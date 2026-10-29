import { getSettingsData } from '../controllers/settings.controller';
import { resolveReminderCampaigns } from '../utils/subscription-reminder-config';

// Read afresh for each dispatch: saved admin edits require no restart or redeploy.
export async function getSubscriptionReminderCampaigns() {
  return resolveReminderCampaigns((await getSettingsData()).aisensy_subscription_reminders);
}
