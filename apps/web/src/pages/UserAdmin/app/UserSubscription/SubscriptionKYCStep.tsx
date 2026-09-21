import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KycStep({
  upgradeForm,
  setUpgradeForm,
  kycVerification,
  kycError,
  kycSubmitting,
  setKycVerification,
  setKycError,
  handleKycModalClose,
  handleKycSubmit,
}: {
  upgradeForm: UpgradeFormState;
  setUpgradeForm: React.Dispatch<React.SetStateAction<UpgradeFormState>>;
  kycVerification: PanVerificationSummary | null;
  kycError: string | null;
  kycSubmitting: boolean;
  setKycVerification: React.Dispatch<
    React.SetStateAction<PanVerificationSummary | null>
  >;
  setKycError: React.Dispatch<React.SetStateAction<string | null>>;
  handleKycModalClose: () => void;
  handleKycSubmit: () => void;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          KYC Verification Required
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          We need your PAN details before you can upgrade to a paid plan. This
          helps us comply with SEBI regulations.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subscription-pan" className="text-sm">
          PAN Card*
        </Label>
        <Input
          id="subscription-pan"
          value={upgradeForm.panCard}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setUpgradeForm((prev) => ({
              ...prev,
              panCard: value,
            }));
            setKycVerification(null);
            setKycError(null);
          }}
          maxLength={10}
          placeholder="ABCDE1234F"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use uppercase letters exactly as they appear on your PAN card.
        </p>
      </div>
      {kycVerification && (
        <div
          className={`border rounded-lg p-3 text-sm ${
            kycVerification.valid
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className="font-medium flex items-center">
              {kycVerification.valid ? "PAN verified" : "Verification pending"}
            </p>
            {kycVerification.referenceId && (
              <span className="text-xs text-muted-foreground">
                Ref: {kycVerification.referenceId}
              </span>
            )}
          </div>
          {kycVerification.registeredName && (
            <p className="text-gray-700 mt-1">
              Registered Name: <strong>{kycVerification.registeredName}</strong>
            </p>
          )}
          {kycVerification.message && (
            <p className="text-gray-600 mt-1">{kycVerification.message}</p>
          )}
        </div>
      )}
      {kycError && <p className="text-sm text-red-600">{kycError}</p>}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={handleKycModalClose}
          disabled={kycSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleKycSubmit}
          disabled={kycSubmitting}
          className="w-full sm:w-auto"
        >
          {"Verify & Continue"}
        </Button>
      </div>
    </div>
  );
}
