// apps/web/src/pages/Admin/Settings/index.tsx
import { useEffect, useState, useRef } from "react";
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
import { getAdminSettings, updateAdminSettings } from "@/api/settings-api";
import { uploadFile } from "@/api/files-api";
import { toast } from "sonner";
import { Upload } from "lucide-react";

type AdminSettings = {
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
  agreement_file_url?: string; // Added for displaying uploaded agreement
};

const AdminSettings = () => {
  const [form, setForm] = useState<AdminSettings>({
    site_name: "Admin Dashboard",
    contact_recipient_email: "",
    maintenance_mode: false,
    allow_user_registrations: true,
    recommendation_sheet_url: "",
    live_recommendation_sheet_url: "",
    agreement_file_url: "",
  });
  const [saving, setSaving] = useState(false);

  // Upload states
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminSettings(true);
        setForm((p) => ({ ...p, ...(data || {}) }));
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
      await updateAdminSettings(form);
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
