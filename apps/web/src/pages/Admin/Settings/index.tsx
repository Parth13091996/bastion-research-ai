import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import axiosInstance from '@/api/axios';
import { endpoints } from '@/api/endpoints';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [contactEmail, setContactEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [recoUrl, setRecoUrl] = useState("");
  const [recoPath, setRecoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gsheetId, setGsheetId] = useState("");
  const [gsheetRange, setGsheetRange] = useState("Sheet1!A1:Z");

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(endpoints.settings.contactEmail.get);
        setContactEmail(res.data?.email || '');
      } catch (e) {
        // fallback to blank
      }
      try {
        const res = await axiosInstance.get(endpoints.settings.recommendationsSheet.get);
        setRecoUrl(res.data?.url || '');
        setRecoPath(res.data?.path || null);
      } catch (e) {
        // ignore
      }
      try {
        const res = await axiosInstance.get(endpoints.settings.recommendationsGsheet.get);
        setGsheetId(res.data?.spreadsheetId || '');
        setGsheetRange(res.data?.range || 'Sheet1!A1:Z');
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const saveContactEmail = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(endpoints.settings.contactEmail.update, { email: contactEmail });
      toast.success('Contact email saved');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save contact email');
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
          <CardDescription>Manage your site settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" placeholder="Enter your site name" defaultValue="Admin Dashboard" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Contact Form Recipient Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter recipient email for contact form submissions"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
              <span>Maintenance Mode</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Temporarily disable public access to your site.
              </span>
            </Label>
            <Switch id="maintenance-mode" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-registrations" className="flex flex-col space-y-1">
              <span>Allow User Registrations</span>
               <span className="font-normal leading-snug text-muted-foreground">
                Allow new users to register for an account.
              </span>
            </Label>
            <Switch id="allow-registrations" defaultChecked />
          </div>

          {/* Recommendations Spreadsheet Settings */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="reco-url">Recommendations Spreadsheet URL (CSV/XLSX)</Label>
            <Input
              id="reco-url"
              placeholder="https://docs.google.com/spreadsheets/d/<id>/pub?output=csv"
              value={recoUrl}
              onChange={(e) => setRecoUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    setSaving(true);
                    await axiosInstance.put(endpoints.settings.recommendationsSheet.update, { url: recoUrl });
                    toast.success('Spreadsheet URL saved');
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to save spreadsheet URL');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save URL'}
              </Button>
              {recoPath ? (
                <span className="text-xs text-muted-foreground self-center">Uploaded: {recoPath}</span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Recommendations Spreadsheet (CSV/XLSX)</Label>
            <input
              type="file"
              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setUploading(true);
                  const fd = new FormData();
                  fd.append('file', f);
                  const res = await axiosInstance.post(endpoints.settings.recommendationsSheet.upload, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  setRecoPath(res.data?.path || null);
                  toast.success('Spreadsheet uploaded');
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || 'Upload failed');
                } finally {
                  setUploading(false);
                }
              }}
            />
            {uploading ? <span className="text-sm">Uploading...</span> : null}
          </div>

          {/* Google Sheets Settings */}
          <div className="space-y-2 pt-6 border-t">
            <Label htmlFor="gsheet-id">Google Spreadsheet ID</Label>
            <Input
              id="gsheet-id"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={gsheetId}
              onChange={(e) => setGsheetId(e.target.value)}
            />
            <Label htmlFor="gsheet-range">Range</Label>
            <Input
              id="gsheet-range"
              placeholder="Sheet1!A1:Z"
              value={gsheetRange}
              onChange={(e) => setGsheetRange(e.target.value)}
            />
            <div>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    setSaving(true);
                    await axiosInstance.put(endpoints.settings.recommendationsGsheet.update, { spreadsheetId: gsheetId, range: gsheetRange });
                    toast.success('Google Sheet settings saved');
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to save Google Sheet settings');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Google Sheet'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={saveContactEmail} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettings;
