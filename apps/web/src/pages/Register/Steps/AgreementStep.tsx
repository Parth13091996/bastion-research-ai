import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Check } from "lucide-react";
import SignaturePad from "signature_pad";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

const AGREEMENT_SUMMARY = [
  "Investment Risks: All investments carry risk of loss. Past performance does not guarantee future results.",
  "Service Agreement: You agree to pay applicable fees for the services provided.",
  "Privacy: We will protect your personal information as outlined in our privacy policy.",
  "Compliance: You confirm that the provided KYC details are accurate and authorize Bastion to retain a digital signature of this agreement.",
];

const AgreementStep: React.FC<AgreementStepProps> = ({
  agreeToTerms,
  updateFormData,
  onBack,
  onNext,
  formData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(
    () => formData?.agreementSignatureUrl || null
  );

  const identifier = useMemo(() => {
    const email = formData?.email?.trim();
    const phone = formData?.phone?.trim();
    return email || phone || "";
  }, [formData]);

  const handleBeginStroke = useCallback(() => {
    setError(null);
    setIsDrawing(true);
    setExistingSignatureUrl(null);
  }, []);

  const handleEndStroke = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const initialiseSignaturePad = React.useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = parent.clientWidth;
    const height = 220;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, width, height);
    }

    signaturePadRef.current?.off();
    signaturePadRef.current?.removeEventListener("beginStroke", handleBeginStroke);
    signaturePadRef.current?.removeEventListener("endStroke", handleEndStroke);

    const pad = new SignaturePad(canvas, {
      minWidth: 0.5,
      maxWidth: 2.5,
      penColor: "#111827",
    });
    const padAny = pad as any;
    padAny.addEventListener?.("beginStroke", handleBeginStroke);
    padAny.addEventListener?.("endStroke", handleEndStroke);
    signaturePadRef.current = pad;
  }, [handleBeginStroke, handleEndStroke]);

  useEffect(() => {
    initialiseSignaturePad();
    const handleResize = () => initialiseSignaturePad();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      const padAny = signaturePadRef.current as any;
      padAny?.removeEventListener?.("beginStroke", handleBeginStroke);
      padAny?.removeEventListener?.("endStroke", handleEndStroke);
      signaturePadRef.current?.off();
      signaturePadRef.current = null;
    };
  }, [handleBeginStroke, handleEndStroke, initialiseSignaturePad]);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setExistingSignatureUrl(null);
    updateFormData("agreementSignatureUrl", "");
    updateFormData("agreementSignaturePath", "");
    updateFormData("agreementSignedAt", "");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!agreeToTerms) {
      setError("Please accept the terms before continuing.");
      return;
    }

    if (!identifier) {
      setError("Missing customer identifier (email or phone).");
      return;
    }

    const signaturePad = signaturePadRef.current;
    const hasNewSignature = signaturePad && !signaturePad.isEmpty();

    if (!hasNewSignature && !existingSignatureUrl) {
      setError("Please provide your signature to continue.");
      return;
    }

    // Reuse signature already uploaded (user navigating back)
    if (!hasNewSignature && existingSignatureUrl) {
      updateFormData("agreementSignedAt", new Date().toISOString());
      onNext();
      return;
    }

    try {
      setIsSubmitting(true);
      const dataUrl = signaturePad!.toDataURL("image/png");
      const response = await axiosInstance.post(endpoints.files.signatures, {
        dataUrl,
        identifier,
      });

      const url = response?.data?.url as string | undefined;
      const path = response?.data?.path as string | undefined;
      if (!url) {
        throw new Error("Signature upload did not return a URL");
      }

      updateFormData("agreementSignatureUrl", url);
      updateFormData("agreementSignaturePath", path || "");
      updateFormData("agreementSignedAt", new Date().toISOString());
      setExistingSignatureUrl(url);
      signaturePad?.clear();
      onNext();
    } catch (err: any) {
      console.error("Signature upload failed", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to store signature. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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

      <div className="max-h-48 overflow-y-auto border rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-semibold mb-3">Summary</h3>
        <ul className="list-disc list-inside space-y-2">
          {AGREEMENT_SUMMARY.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
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

        <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Draw your signature below
            </span>
            <button
              type="button"
              onClick={clearSignature}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw size={14} className="mr-1" /> Reset
            </button>
          </div>

          {existingSignatureUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={existingSignatureUrl}
                alt="Existing signature"
                className="max-h-40 object-contain"
              />
              <p className="text-xs text-gray-500 flex items-center">
                <Check size={14} className="mr-1 text-green-600" /> Signature on
                file
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg">
              <canvas ref={canvasRef} className="w-full rounded-lg bg-white" />
              {!isDrawing && (
                <p className="text-xs text-gray-500 text-center py-2">
                  Sign inside the box using your mouse or touch input.
                </p>
              )}
            </div>
          )}
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
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? "Saving signature..." : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
};

export default AgreementStep;
