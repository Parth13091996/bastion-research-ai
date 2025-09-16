import React from "react";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

declare global {
  interface Window {
    Digio?: any;
  }
}

const DIGIO_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMTQ0XSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQgL0YxIDI0IFRmIDcyIDcyIFRkIChBZ3JlZW1lbnQpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAxMTcgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAowMDAwMDAwMzc3IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDQ2CiUlRU9GCg==";

const AgreementStep: React.FC<AgreementStepProps> = ({
  agreeToTerms,
  updateFormData,
  onBack,
  onNext,
  formData,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const digioRef = React.useRef<any>(null);

  const env =
    (import.meta as any)?.env?.VITE_DIGIO_ENV === "production"
      ? "production"
      : "sandbox";
  const sdkSrc =
    env === "production"
      ? "https://app.digio.in/sdk/v11/digio.js"
      : "https://ext-gateway.digio.in/sdk/v11/digio.js";

  const loadDigioScript = React.useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Digio) return resolve();
      const existing = document.querySelector(`script[src='${sdkSrc}']`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Digio SDK"))
        );
        return;
      }
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src = sdkSrc;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Digio SDK"));
      document.body.appendChild(s);
    });
  }, [sdkSrc]);

  const identifier = React.useMemo(() => {
    const email = formData?.email?.trim();
    const phone = formData?.phone?.trim();
    return email || phone || "";
  }, [formData]);

  const handleSign = async () => {
    setError(null);
    if (!agreeToTerms) return;
    if (!identifier) {
      setError("Missing customer identifier (email or phone)");
      return;
    }
    setLoading(true);
    try {
      await loadDigioScript();

      // 1) Initiate signature by uploading a tiny PDF via our server
      const initResp = await axiosInstance.post(endpoints.digio.uploadJson, {
        file_data: DIGIO_PDF_BASE64,
        file_name: "agreement.pdf",
        will_self_sign: true,
        include_authentication_url: false,
        display_on_page: "first",
        signers: [
          {
            identifier,
          },
        ],
        // generate_access_token: true, // Enable if you prefer token approach
      });
      const data = initResp?.data?.data || {};
      const documentId = data?.id || data?.document_id;
      if (!documentId) {
        throw new Error("Failed to initiate eSign: no document id returned");
      }

      // 2) Create Digio instance
      const options = {
        environment: env,
        callback: function (response: any) {
          if (response && response.error_code) {
            console.error("Digio error:", response);
            setError(response.message || "eSign failed");
            setLoading(false);
            return;
          }
          try {
            updateFormData("digioDocId", response?.digio_doc_id || documentId);
          } catch {}
          setLoading(false);
          onNext();
        },
        logo: "/favicon.ico",
        theme: {
          primaryColor: "#AB3498",
          secondaryColor: "#000000",
        },
        is_iframe: true,
      };
      const digio = new window.Digio(options);
      digioRef.current = digio;

      // 3) Launch popup/iframe and submit
      digio.init();
      // If using token approach, call: digio.submit(requestId, identifier, token_id)
      digio.submit(documentId, identifier);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.message || e?.message || "Failed to start eSign"
      );
      setLoading(false);
    }
  };

  const handleCancel = () => {
    try {
      digioRef.current?.cancel?.();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Terms & Agreement
        </h2>
        <p className="text-gray-600 text-sm">
          Review, accept and eSign the agreement
        </p>
      </div>

      <div className="max-h-48 overflow-y-auto border rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-semibold mb-2">Terms of Service</h3>
        <p className="mb-4">
          By using TripleEdge services, you agree to the following terms and
          conditions...
        </p>
        <p className="mb-4">
          1. Investment Risks: All investments carry risk of loss. Past
          performance does not guarantee future results.
        </p>
        <p className="mb-4">
          2. Service Agreement: You agree to pay applicable fees for the
          services provided.
        </p>
        <p className="mb-4">
          3. Privacy Policy: We will protect your personal information as
          outlined in our privacy policy.
        </p>
      </div>

      <label className="flex items-start">
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
          className="mt-1 mr-2"
        />
        <span className="text-sm text-gray-700">
          I agree to the Terms of Service and Privacy Policy
        </span>
      </label>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          type="button"
        >
          Cancel eSign
        </button>
        <button
          onClick={handleSign}
          disabled={!agreeToTerms || loading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Starting eSign..." : "Accept & eSign"}
        </button>
      </div>
    </div>
  );
};

export default AgreementStep;
