import { useState } from "react";
import { createWebinarRegistration } from "@/api/webinar-registrations-api";
import mailchimpNewsletterApi from "@/api/mailchimp-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Config } from "@/utils/config";

interface WebinarRegistrationFormProps {
  webinarSlug: string;
  onSuccess?: () => void;
  requirePhone?: boolean;
}

export function WebinarRegistrationForm({
  webinarSlug,
  onSuccess,
  requirePhone = false,
}: WebinarRegistrationFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const subscribeToMailchimp = async (email: string) => {
    try {
      await mailchimpNewsletterApi.subscribe({
        email,
        tags: [Config.mailchimp_tags.portfolio_red_flags_landing],
      });
    } catch (error) {
      // Mailchimp failures should not block webinar registration
      console.error("Mailchimp integration error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    if (requirePhone && !form.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    try {
      setSubmitting(true);

      const url = new URL(window.location.href);
      const params = url.searchParams;

      await createWebinarRegistration({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        webinar_slug: webinarSlug,
        source: "portfolio-red-flags-landing",
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      });

      // Mailchimp subscribe in parallel (do not block registration flow)
      subscribeToMailchimp(form.email.trim());

      toast.success("You're registered for the webinar!");

      setForm({
        name: "",
        email: "",
        phone: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
        "Failed to register. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          disabled={submitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={submitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{`Phone${requirePhone ? "" : " (optional)"}`}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+91 8780507966"
          disabled={submitting}
          required={requirePhone}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#C00000] hover:bg-[#A00000] text-white font-semibold py-3 rounded-xl"
        disabled={submitting}
      >
        {submitting ? "Registering..." : "Register for the Webinar"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By registering, you agree to receive important updates about this
        webinar on your email.
      </p>
    </form>
  );
}

