import { supabase } from "../supabase";
import { sendSubscriptionExpiryReminderEmail } from "../services/emailNotification.service";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type ExpiringUserRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  subscription_end_date?: string | null;
  membership_plans?: {
    plan_name?: string | null;
  } | null;
};

const getTargetDateString = () => {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  return target.toISOString().split("T")[0];
};

export const runSubscriptionExpiryReminder = async () => {
  const targetDate = getTargetDateString();
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        first_name,
        subscription_end_date,
        membership_plans (
          plan_name
        )
      `
      )
      .eq("subscription_end_date", targetDate)
      .eq("status", "active");

    if (error) {
      console.error("Failed to fetch expiring subscriptions", error);
      return;
    }

    const rows = (data ?? []) as ExpiringUserRow[];
    if (rows.length === 0) {
      console.info(
        `No subscriptions ending on ${targetDate}; reminder run complete.`
      );
      return;
    }

    for (const user of rows) {
      if (!user?.email || !user?.subscription_end_date) continue;
      const firstNameValue = user.first_name;
      const firstName =
        typeof firstNameValue === "string" ? firstNameValue : undefined;
      const planNameValue = user.membership_plans?.plan_name;
      let planName: string | undefined = undefined;
      if (typeof planNameValue === "string") {
        planName = planNameValue;
      }
      await sendSubscriptionExpiryReminderEmail({
        to: user.email,
        firstName,
        planName,
        subscriptionEndDate: user.subscription_end_date,
      });
      console.info(
        `Sent expiry reminder to ${user.email} for ${user.subscription_end_date}`
      );
    }
  } catch (error) {
    console.error("Subscription reminder job failed", error);
  }
};

let scheduled = false;
let lastRunDay: string | null = null;

export const startSubscriptionExpiryReminderJob = () => {
  if (scheduled || process.env.NODE_ENV === "test") return;
  scheduled = true;

  const execute = async () => {
    const today = new Date().toISOString().split("T")[0];
    if (lastRunDay === today) {
      console.info("Subscription reminder already ran today.");
      return;
    }
    lastRunDay = today;
    await runSubscriptionExpiryReminder();
  };

  execute();
  setInterval(() => {
    execute().catch((error) => {
      console.error("Subscription reminder scheduler error", error);
    });
  }, ONE_DAY_MS);
};
