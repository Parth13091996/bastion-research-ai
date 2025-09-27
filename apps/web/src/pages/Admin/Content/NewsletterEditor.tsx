import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListChecks, MailPlus, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const MAILCHIMP_DASHBOARD_URL = import.meta.env.VITE_MAILCHIMP_MANAGE_URL as string | undefined;

const NewsletterEditor: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenMailchimp = () => {
    if (MAILCHIMP_DASHBOARD_URL) {
      window.open(MAILCHIMP_DASHBOARD_URL, "_blank", "noopener,noreferrer");
    } else {
      window.open("https://login.mailchimp.com/", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <MailPlus className="h-6 w-6 text-blue-500" />
            Manage Newsletters in Mailchimp
          </CardTitle>
          <CardDescription>
            Newsletter creation and editing now happens directly in Mailchimp. Use the buttons below to open your Mailchimp dashboard or return to the sync overview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-500" />
              Workflow
            </h3>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Create or update a campaign inside Mailchimp.</li>
              <li>Return to the Bastion admin &gt; Newsletter Management page.</li>
              <li>Click “Sync Latest” to pull the newest content from the RSS feed.</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="default" onClick={handleOpenMailchimp}>
              <MailPlus className="h-4 w-4 mr-2" />
              Open Mailchimp Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <Undo2 className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterEditor;
