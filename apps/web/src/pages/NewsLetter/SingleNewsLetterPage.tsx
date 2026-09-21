import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentViewer from "@/components/public/ContentViewer";
import mailchimpNewsletterApi from "@/api/mailchimp-api";
import { newsletterApi } from "@/api/content";
import { Newsletter } from "@repo/types";
import { toast } from "sonner";

const NewsletterView: React.FC = () => {
  const navigate = useNavigate();
   const { id } = useParams();
   const [manualNewsletter, setManualNewsletter] = useState<Newsletter | null>(
     null
   );
   const [checkedManual, setCheckedManual] = useState(false);

   useEffect(() => {
     if (!id) return;

     const loadManualNewsletter = async () => {
       try {
        const data = await newsletterApi.getById(id);
        // Render the manual newsletter here; external links are handled from the list page
        setManualNewsletter(data);
       } catch (error: any) {
         // If not found (404), fall back to Mailchimp viewer below
         const status = error?.response?.status;
         if (status && status !== 404) {
           console.error(error);
           toast.error("Failed to load newsletter");
         }
       } finally {
         setCheckedManual(true);
       }
     };

     loadManualNewsletter();
   }, [id]);

  const handleBack = () => {
    navigate("/newsletters-archive");
  };

  // Still checking manual newsletter first
  if (!checkedManual) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Manual newsletter without external link: render plain_text (if present)
  if (manualNewsletter && !manualNewsletter.link) {
    return (
      <div className="container mx-auto py-6">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Archive
        </button>

        <h1 className="text-3xl font-semibold mb-4">
          {manualNewsletter.title}
        </h1>
        {manualNewsletter.sub_title && (
          <p className="text-lg text-gray-600 mb-4">
            {manualNewsletter.sub_title}
          </p>
        )}

        {manualNewsletter.plain_text && (
          <div className="simple-editor-wrapper">
            <div className="simple-editor-content">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: manualNewsletter.plain_text }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: fall back to existing Mailchimp viewer
  return (
    <ContentViewer
      type="newsletter"
      api={mailchimpNewsletterApi}
      onBack={handleBack}
    />
  );
};

export default NewsletterView;
