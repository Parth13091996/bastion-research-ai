// apps/web/src/pages/Admin/Settings/index.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getAdminSettings, updateAdminSettings, type ReminderCampaigns, type ReminderCampaign, type ReminderStage } from "@/api/settings-api";
import { uploadFile } from "@/api/files-api";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { WebinarDateField } from "@/components/admin/WebinarDateField";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppRoutes } from "@/routes/app-routes";

import { Textarea } from '@/components/ui/textarea';

const renewalStages: { key: ReminderStage; label: string }[] = [
  { key: 'one_week_before', label: '7 days before expiry' },
  { key: 'expiry_day', label: 'Expiry day' },
  { key: 'one_week_after', label: '7 days after expiry' },
  { key: 'fifteen_days_after', label: '15 days after expiry' },
];
const renewalTokens = ['name', 'first_name', 'last_name', 'email', 'phone', 'expiry_date', 'plan_name', 'reminder_label'];

type AdminSettings = {
  aisensy_subscription_reminders?: ReminderCampaigns;
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
  agreement_file_url?: string; // Added for displaying uploaded agreement
  invoice_file_url?: string;
  aisensy_webinar_name?: string;
  aisensy_webinar_date?: string;
  aisensy_webinar_time?: string;
  aisensy_joining_link?: string;
  aisensy_campaign_name?: string;
  mailchimp_webinar_date?: string;
  mailchimp_webinar_time?: string;
};

const AdminSettings = () => {
  const { isAdmin, isLoading } = useAuth();
  const [form, setForm] = useState<AdminSettings>({
    site_name: "Admin Dashboard",
    contact_recipient_email: "",
    maintenance_mode: false,
    allow_user_registrations: true,
    recommendation_sheet_url: "",
    live_recommendation_sheet_url: "",
    agreement_file_url: "",
    invoice_file_url: "",
    aisensy_webinar_name: "",
    aisensy_webinar_date: "",
    aisensy_webinar_time: "",
    aisensy_joining_link: "",
    aisensy_campaign_name: "",
    mailchimp_webinar_date: "",
    mailchimp_webinar_time: "",
  });
  const [saving, setSaving] = useState(false);

  // Upload states
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [invoiceUploadError, setInvoiceUploadError] = useState<string | null>(
    null
  );
  const invoiceFileInputRef = useRef<HTMLInputElement | null>(null);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [remindersSaving, setRemindersSaving] = useState(false);
  const [remindersError, setRemindersError] = useState('');
  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const data = await getAdminSettings(true);
      setForm((previous) => ({ ...previous, ...data }));
    } catch {
      setSettingsError('Settings could not be loaded. Retry before making changes.');
    } finally {
      setSettingsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (isAdmin) void loadSettings();
  }, [isAdmin, loadSettings]);

  const setReminder = (stage: ReminderStage, patch: Partial<ReminderCampaign>) => {
    setForm(previous => previous.aisensy_subscription_reminders ? ({ ...previous,
      aisensy_subscription_reminders: { ...previous.aisensy_subscription_reminders,
        [stage]: { ...previous.aisensy_subscription_reminders[stage], ...patch } },
    }) : previous);
  };
  const saveReminders = async () => {
    if (!form.aisensy_subscription_reminders) return;
    setRemindersSaving(true);
    setRemindersError('');
    try {
      const campaigns = Object.fromEntries(Object.entries(form.aisensy_subscription_reminders).map(([stage, value]) =>
        [stage, { ...value, templateParams: value.templateParams.map(line => line.trim()).filter(Boolean) }])) as ReminderCampaigns;
      const saved = await updateAdminSettings({ aisensy_subscription_reminders: campaigns });
      setForm(previous => ({ ...previous, aisensy_subscription_reminders: saved.aisensy_subscription_reminders }));
      toast.success('Renewal reminder settings saved');
    } catch (error: any) {
      setRemindersError(error?.response?.data?.message || 'Renewal settings could not be saved. Your edits are still here.');
    } finally {
      setRemindersSaving(false);
    }
  };

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setSaving(true);
      const { aisensy_subscription_reminders, ...siteSettings } = form;
      await updateAdminSettings(siteSettings);
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // File upload logic for Agreement file
  const handleAgreementUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAgreement(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadFile(formData);

      if (response.data && response.data.url) {
        setForm((prev) => ({
          ...prev,
          agreement_file_url: response.data.url,
        }));
        toast.success("File uploaded successfully!");
      } else {
        setUploadError("No url found in upload response");
        toast.error("No URL found in upload response");
      }
    } catch (error: any) {
      setUploadError(error?.response?.data?.error || "Failed to upload file");
      toast.error(error?.response?.data?.error || "Failed to upload file");
    } finally {
      setUploadingAgreement(false);
      // Clear file input so same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInvoiceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInvoiceUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInvoice(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadFile(formData);

      if (response.data && response.data.url) {
        setForm((prev) => ({
          ...prev,
          invoice_file_url: response.data.url,
        }));
        toast.success("Invoice template uploaded successfully!");
      } else {
        setInvoiceUploadError("No url found in upload response");
        toast.error("No URL found in upload response");
      }
    } catch (error: any) {
      setInvoiceUploadError(
        error?.response?.data?.error || "Failed to upload invoice template"
      );
      toast.error(
        error?.response?.data?.error || "Failed to upload invoice template"
      );
    } finally {
      setUploadingInvoice(false);
      if (invoiceFileInputRef.current) {
        invoiceFileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={AppRoutes.adminDashboard} replace />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings Panel</h1>
      {settingsError && <div role="alert" className="mb-6 rounded-md border p-4 text-red-600">{settingsError} <Button variant="outline" onClick={loadSettings}>Retry loading settings</Button></div>}
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage your site settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="Enter your site name"
              value={form.site_name || ""}
              onChange={(e) => set("site_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Contact Form Recipient Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter recipient email for contact form submissions"
              value={form.contact_recipient_email || ""}
              onChange={(e) => set("contact_recipient_email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reco-url">Recommendations Sheet URL (Admin)</Label>
            <Input
              id="reco-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/..."
              value={form.recommendation_sheet_url || ""}
              onChange={(e) => set("recommendation_sheet_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-reco-url">
              Live Recommendations Sheet URL (Dashboard)
            </Label>
            <Input
              id="live-reco-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/..."
              value={form.live_recommendation_sheet_url || ""}
              onChange={(e) =>
                set("live_recommendation_sheet_url", e.target.value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="maintenance-mode"
              className="flex flex-col space-y-1"
            >
              <span>Maintenance Mode</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Temporarily disable public access to your site.
              </span>
            </Label>
            <Switch
              id="maintenance-mode"
              checked={!!form.maintenance_mode}
              onCheckedChange={(v) => set("maintenance_mode", v)}
            />
          </div>

          {/* Agreement File Upload */}
          <div className="space-y-2">
            <Label htmlFor="agreement-upload">User Agreement File Upload</Label>
            <div className="flex gap-2 flex-col sm:flex-row items-start sm:items-center">
              <label className="cursor-pointer flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAgreement}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    {uploadingAgreement ? "Uploading..." : "Upload Agreement"}
                  </span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="agreement-upload"
                  onChange={handleAgreementUpload}
                  disabled={uploadingAgreement}
                />
              </label>
              {/* Show the uploaded URL in an input, or a placeholder */}
              <Input
                value={form.agreement_file_url || ""}
                placeholder="Uploaded Agreement file"
                readOnly
                className="flex-1 min-w-[300px]"
                style={{
                  background: form.agreement_file_url ? "white" : "#f4f4f5",
                  color: form.agreement_file_url ? "black" : "#9ca3af",
                }}
              />
            </div>
            {uploadError && (
              <div className="text-xs text-red-600 mt-1">{uploadError}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-upload">Invoice Template Upload</Label>
            <div className="flex gap-2 flex-col sm:flex-row items-start sm:items-center">
              <label className="cursor-pointer flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingInvoice}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    {uploadingInvoice ? "Uploading..." : "Upload Invoice"}
                  </span>
                </Button>
                <input
                  ref={invoiceFileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  id="invoice-upload"
                  onChange={handleInvoiceUpload}
                  disabled={uploadingInvoice}
                />
              </label>
              <Input
                value={form.invoice_file_url || ""}
                placeholder="Uploaded Invoice template"
                readOnly
                className="flex-1 min-w-[300px]"
                style={{
                  background: form.invoice_file_url ? "white" : "#f4f4f5",
                  color: form.invoice_file_url ? "black" : "#9ca3af",
                }}
              />
            </div>
            {invoiceUploadError && (
              <div className="text-xs text-red-600 mt-1">
                {invoiceUploadError}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="allow-registrations"
              className="flex flex-col space-y-1"
            >
              <span>Allow User Registrations</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Allow new users to register for an account.
              </span>
            </Label>
            <Switch
              id="allow-registrations"
              checked={!!form.allow_user_registrations}
              onCheckedChange={(v) => set("allow_user_registrations", v)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={save} disabled={saving || settingsLoading || !!settingsError}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Subscription renewal — AiSensy</CardTitle>
          <CardDescription>
            Manage all four reminder stages. Use the exact live AiSensy API campaign name linked to your approved WhatsApp template.
            To change the message wording, update the template in AiSensy and enter its campaign name here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Saving applies to future unsent reminders without a redeploy. Reminders already sent will not be resent. Disabling a stage pauses both its WhatsApp and email reminders.</p>
          {settingsLoading ? <p role="status">Loading renewal reminders...</p> : !form.aisensy_subscription_reminders ?
            <p role="alert">Renewal reminder configuration is unavailable. No existing campaigns will be overwritten.</p> :
            <div className="grid gap-6 lg:grid-cols-2">
              {renewalStages.map(({ key, label }) => {
                const campaign = form.aisensy_subscription_reminders![key];
                return <fieldset key={key} className="min-w-0 rounded-lg border p-4 space-y-4">
                  <legend className="px-2 font-semibold">{label}</legend>
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor={`renewal-${key}-enabled`}>Enable this reminder</Label>
                    <Switch id={`renewal-${key}-enabled`} checked={campaign.enabled} onCheckedChange={enabled => setReminder(key, { enabled })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`renewal-${key}-campaign`}>AiSensy API campaign name</Label>
                    <Input id={`renewal-${key}-campaign`} value={campaign.campaignName} maxLength={200} onChange={event => setReminder(key, { campaignName: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`renewal-${key}-variables`}>Variables, in template order</Label>
                    <Textarea id={`renewal-${key}-variables`} rows={3} maxLength={20000} value={campaign.templateParams.join('\n')}
                      placeholder="One value per line. Leave empty for templates with no variables."
                      aria-describedby={`renewal-${key}-variable-help`}
                      onChange={event => setReminder(key, { templateParams: event.target.value.split('\n') })} />
                    <p id={`renewal-${key}-variable-help`} className="text-xs text-muted-foreground">One value per line. Use a supported variable below or type a fixed value, such as a renewal link. The number and order must match your AiSensy template.</p>
                    <div className="flex flex-wrap gap-1">
                      {renewalTokens.map(token => <button key={token} type="button" className="rounded border px-2 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Add ${token} variable to ${label}`} onClick={() => setReminder(key, { templateParams: [...campaign.templateParams.filter(Boolean), `{{${token}}}`] })}>{`{{${token}}}`}</button>)}
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.templateParams.filter(value => value.trim()).length} variable values</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`renewal-${key}-media`}>Template image URL (optional)</Label>
                    <Input id={`renewal-${key}-media`} type="url" placeholder="https://..." value={campaign.mediaUrl} onChange={event => setReminder(key, { mediaUrl: event.target.value })} />
                    <p className="text-xs text-muted-foreground">Use a public HTTPS image for image templates. Leave empty for text-only templates.</p>
                  </div>
                </fieldset>;
              })}
            </div>}
          {remindersError && <p role="alert" className="text-sm text-red-600">{remindersError}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={saveReminders} disabled={remindersSaving || settingsLoading || !!settingsError || !form.aisensy_subscription_reminders}>
            {remindersSaving ? 'Saving reminders...' : 'Save Renewal Reminders'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Webinar — AiSensy (WhatsApp)</CardTitle>
          <CardDescription>
            Sent with the portfolio webinar registration flow. Template
            parameters are sent in order: registrant name, webinar name, date,
            time, joining link, phone, webinar slug. API key stays in server env;
            campaign name can be set here instead of AISENSY_CAMPAIGN_NAME.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aisensy-webinar-name">Webinar name</Label>
            <Input
              id="aisensy-webinar-name"
              placeholder="e.g. Portfolio Red Flags — Live session"
              value={form.aisensy_webinar_name || ""}
              onChange={(e) => set("aisensy_webinar_name", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <WebinarDateField
              id="aisensy-webinar-date"
              label="Date"
              value={form.aisensy_webinar_date || ""}
              onChange={(v) => set("aisensy_webinar_date", v)}
            />
            <div className="space-y-2">
              <Label htmlFor="aisensy-webinar-time">Time</Label>
              <Input
                id="aisensy-webinar-time"
                type="time"
                value={form.aisensy_webinar_time || ""}
                onChange={(e) => set("aisensy_webinar_time", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aisensy-joining-link">Joining link</Label>
            <Input
              id="aisensy-joining-link"
              type="url"
              placeholder="https://..."
              value={form.aisensy_joining_link || ""}
              onChange={(e) => set("aisensy_joining_link", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aisensy-campaign-name">Campaign name</Label>
            <Input
              id="aisensy-campaign-name"
              placeholder="AiSensy campaign name (replaces env if set)"
              value={form.aisensy_campaign_name || ""}
              onChange={(e) => set("aisensy_campaign_name", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={save} disabled={saving || settingsLoading || !!settingsError}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Webinar — Mailchimp</CardTitle>
          <CardDescription>
            Date and time saved here are sent to Mailchimp merge fields when
            someone registers with the portfolio webinar tag. Set{" "}
            <code className="text-xs bg-muted px-1 rounded">
              MAILCHIMP_WEBINAR_DATE_MERGE_TAG
            </code>{" "}
            and{" "}
            <code className="text-xs bg-muted px-1 rounded">
              MAILCHIMP_WEBINAR_TIME_MERGE_TAG
            </code>{" "}
            on the server (e.g. MMERGE7) to match your audience fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <WebinarDateField
              id="mailchimp-webinar-date"
              label="Date"
              value={form.mailchimp_webinar_date || ""}
              onChange={(v) => set("mailchimp_webinar_date", v)}
            />
            <div className="space-y-2">
              <Label htmlFor="mailchimp-webinar-time">Time</Label>
              <Input
                id="mailchimp-webinar-time"
                type="time"
                value={form.mailchimp_webinar_time || ""}
                onChange={(e) => set("mailchimp_webinar_time", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={save} disabled={saving || settingsLoading || !!settingsError}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettings;
