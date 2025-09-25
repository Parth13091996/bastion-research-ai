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

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(endpoints.settings.contactEmail.get);
        setContactEmail(res.data?.email || '');
      } catch (e) {
        // fallback to blank
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
