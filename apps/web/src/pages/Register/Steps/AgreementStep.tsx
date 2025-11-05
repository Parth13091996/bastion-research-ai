import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import useDigioSdk from "@/hooks/use-digio-sdk";
import { getUserInfoToShowInPdf } from "@/utils";
import { Config } from "@/utils/config";
import { handlePersonalizedPdf } from "@/utils/pdf";
import { User } from "@repo/types";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const AgreementStep: React.FC<AgreementStepProps> = ({
  agreeToTerms,
  updateFormData,
  onBack,
  onNext,
  formData,
}) => {
  const pdfUrl =
    "https://ftuuyfhfrhvlllfwfbjx.supabase.co/storage/v1/object/public/system_docs/TERMS%20AND%20CONDITIONS%20OF%20RESEARCH%20ANALYST%20SERVICES%20-%20Client%20Agreement.pdf";
  const [error, setError] = useState<string | null>(null);
  const [pdfUrlWithAddress, setPdfUrlWithAddress] = useState("");
  const [isEsignSubmitting, setIsEsignSubmitting] = useState(false);

  const { refetchUserAfterAgreement } = useAuth();

  const identifier = useMemo(() => {
    const email = formData?.email?.trim();
    const phone = formData?.phone?.trim();
    return email || phone || "";
  }, [formData]);

  const { init: initDigio, submit: submitDigio } = useDigioSdk({
    environment: Config.digio_environment,
    is_iframe: true,
    callback: (response: any) => {
      if (
        response &&
        Object.prototype.hasOwnProperty.call(response, "error_code")
      ) {
        setError(response?.message || "E-signing failed. Please try again.");
        setIsEsignSubmitting(false);
        return;
      }
      refetchUserAfterAgreement().then(async (user: User) => {
        if (
          response?.digio_doc_id &&
          response?.message === "Signed Successfully"
        ) {
          await axiosInstance.put(endpoints.users.update(user?.id), {
            status: "agreement_signed",
          });
          updateFormData("agreementSignedAt", new Date().toISOString());
          setIsEsignSubmitting(false);
          onNext();
        }
      });
    },
  });

  useEffect(() => {
    (async () => {
      const base64Value = await handlePersonalizedPdf(
        pdfUrl,
        getUserInfoToShowInPdf(formData)
      );
      const pdfDataUrl = `data:application/pdf;base64,${base64Value}`;
      setPdfUrlWithAddress(pdfDataUrl);
    })();
  }, []);

  const handleEsign = async () => {
    setError(null);
    if (!agreeToTerms) {
      setError("Please accept the terms before continuing.");
      return;
    }
    if (!identifier) {
      setError("Missing customer identifier (email or phone).");
      return;
    }
    try {
      setIsEsignSubmitting(true);
      initDigio();
      const resp = await axiosInstance.post(endpoints.digio.esignUploadJson, {
        file_data: pdfUrlWithAddress,
        file_name: Config.agreement_file_name(formData),
        will_self_sign: true,
        include_authentication_url: true,
        signers: [
          {
            identifier,
            name: formData?.email || formData?.phone || "User",
          },
        ],
      });

      const _documentId =
        resp?.data?.data?.id || resp?.data?.data?.document_id || resp?.data?.id;
      if (!_documentId) {
        throw new Error("Failed to create e-sign request (no document id)");
      }

      submitDigio(_documentId, identifier);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to start e-signing. Please try again."
      );
      setIsEsignSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Terms & Agreement
        </h2>
        <p className="text-gray-600 text-sm">
          Review the agreement and sign digitally to proceed.
        </p>
      </div>

      <div className="max-h-[300px] overflow-y-auto border rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-semibold mb-3">Summary</h3>
        <PdfPreview pdfUrl={pdfUrlWithAddress} />
      </div>

      <div className="space-y-3">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
            className="mt-1 mr-2"
          />
          <span className="text-sm text-gray-700">
            I have read the summary above and agree to the full Terms of Service
            and Privacy Policy.
          </span>
        </label>

        <div className="border rounded-xl p-4 bg-white">
          <button
            type="button"
            onClick={handleEsign}
            disabled={isEsignSubmitting}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isEsignSubmitting
              ? "Starting e-signing..."
              : "E-sign Agreement (Popup)"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
      </div>
    </div>
  );
};

export default AgreementStep;

function PdfPreview({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div style={{ width: "100%", height: "120vh" }}>
      <iframe
        src={
          pdfUrl
            ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`
            : pdfUrl
        }
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="PDF Preview"
      />
    </div>
  );
}
