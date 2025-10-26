import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { toast } from "sonner";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const KYCStep: React.FC<KYCStepProps> = ({
  formData,
  updateFormData,
  onBack,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [verification, setVerification] =
    useState<PanVerificationSummary | null>(formData.panVerification || null);

  useEffect(() => {
    setVerification(formData.panVerification || null);
  }, [formData.panVerification]);

  const fullName = useMemo(() => {
    return `${formData.firstName || ""} ${formData.lastName || ""}`
      .trim()
      .replace(/\s+/g, " ");
  }, [formData.firstName, formData.lastName]);

  const handleVerify = async () => {
    setError(null);
    const pan = (formData.panCard || "").trim().toUpperCase();

    if (!pan || !PAN_REGEX.test(pan)) {
      setError("Please enter a valid PAN (e.g. ABCDE1234F)");
      return;
    }

    if (!fullName) {
      setError("Please provide your first and last name in the previous step.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axiosInstance.post(
        endpoints.cashfreeVerification.verifyPan,
        {
          pan,
          name: formData.firstName + " " + formData.lastName,
        }
      );

      const data = response?.data || {};
      const result: PanVerificationSummary = {
        referenceId: data.referenceId,
        valid: Boolean(data.valid),
        status: data.status,
        registeredName: data.registeredName,
        nameMatchScore: data.nameMatchScore,
        message: data.message,
        checkedAt: new Date().toISOString(),
      };
      setVerification(result);
      updateFormData("panCard", pan);
      updateFormData("panVerification", result);

      if (result.valid) {
        toast.success("PAN verified successfully");
      } else {
        toast.error(result.message || "PAN verification failed");
      }
    } catch (err: any) {
      console.error("PAN verification failed", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to verify PAN. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const messageForStatus = (result: PanVerificationSummary) => {
    if (result.valid) return "PAN verified successfully";
    if (result.message) return result.message;
    if (result.status === "PENDING") return "Verification is still pending.";
    return "Unable to verify PAN.";
  };

  const handleCheckStatus = async () => {
    if (!verification?.referenceId) return;
    setError(null);
    setIsCheckingStatus(true);
    try {
      const response = await axiosInstance.get(
        endpoints.cashfreeVerification.panStatus(verification.referenceId)
      );
      const data = response?.data || {};
      const result: PanVerificationSummary = {
        referenceId: data.referenceId ?? verification.referenceId,
        valid: Boolean(data.valid),
        status: data.status,
        registeredName: data.registeredName,
        nameMatchScore: data.nameMatchScore,
        message: data.message,
        checkedAt: new Date().toISOString(),
      };
      setVerification(result);
      updateFormData("panVerification", result);

      if (result.valid) {
        toast.success("PAN verification successful");
      } else {
        toast.info(messageForStatus(result));
      }
    } catch (err: any) {
      console.error("PAN status check failed", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch PAN status.";
      setError(message);
      toast.error(message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleContinue = async () => {
    setError(null);

    // Validate mandatory fields
    if (!formData.panCard.trim()) {
      setError("Please enter PAN card.");
      return;
    }

    if (!verification?.valid) {
      setError("Please complete PAN verification before continuing.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoints.auth.onboardStart, {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        address1: formData.address1,
        address2: formData.address2,
        state: formData.state,
        city: formData.city,
        pinCode: formData.pinCode,
        company: formData.company,
        panCard: formData.panCard,
        panVerification: verification,
      });
      setLoading(false);
      onNext();
    } catch (e: any) {
      const m =
        e?.response?.data?.message || e?.message || "Failed to save onboarding";
      setError(m);
    }
  };

  const resetVerification = () => {
    setVerification(null);
    updateFormData("panVerification", null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          KYC Verification
        </h2>
        <p className="text-gray-600 text-sm">
          Verify your PAN instantly using Cashfree's verification service.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Card*
          </label>
          <input
            type="text"
            value={formData.panCard}
            onChange={(e) => {
              setError(null);
              if (verification) {
                resetVerification();
              }
              updateFormData("panCard", e.target.value.toUpperCase());
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 tracking-widest"
            placeholder="ABCDE1234F"
            maxLength={10}
            autoCapitalize="characters"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ensure the name you provided earlier matches the name on your PAN
            card.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify PAN"
            )}
          </button>
          {verification && (
            <button
              type="button"
              onClick={resetVerification}
              className="inline-flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Re-verify
            </button>
          )}
          {verification?.referenceId && (
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="inline-flex items-center px-4 py-2 text-sm border border-blue-200 text-blue-600 rounded-lg hover:border-blue-300 disabled:text-gray-400"
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking status...
                </>
              ) : (
                "Check status"
              )}
            </button>
          )}
        </div>

        {verification && (
          <div
            className={`border rounded-lg p-4 text-sm ${
              verification.valid
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center text-sm font-medium">
                {verification.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                {verification.valid
                  ? "PAN verified successfully"
                  : "Unable to verify PAN"}
              </div>
              {verification.referenceId && (
                <span className="text-xs text-gray-500">
                  Ref: {verification.referenceId}
                </span>
              )}
            </div>
            {verification.registeredName && (
              <p className="mt-2 text-gray-700">
                Registered Name: <strong>{verification.registeredName}</strong>
              </p>
            )}
            {verification.nameMatchScore && (
              <p className="text-gray-600">
                Name Match Score: {verification.nameMatchScore}
              </p>
            )}
            {verification.message && (
              <p className="text-gray-600 mt-1">{verification.message}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!verification?.valid || isVerifying || loading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default KYCStep;
