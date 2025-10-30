// apps/web/src/pages/Admin/Settings/index.tsx
import { useEffect, useState } from "react";
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
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { toast } from "sonner";

type AdminSettings = {
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
};

const AdminSettings = () => {
  const [form, setForm] = useState<AdminSettings>({
    site_name: "Admin Dashboard",
    contact_recipient_email: "",
    maintenance_mode: false,
    allow_user_registrations: true,
    recommendation_sheet_url: "",
    live_recommendation_sheet_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(endpoints.settings.admin.get);
        setForm((p) => ({ ...p, ...(res.data || {}) }));
      } catch {
        // fallback remain
      }
    })();
  }, []);

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(endpoints.settings.admin.update, form);
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings Panel</h1>
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
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettings;
