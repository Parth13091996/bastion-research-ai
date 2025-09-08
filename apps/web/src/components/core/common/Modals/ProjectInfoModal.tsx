import Modal from "@/components/core/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/stores/modal-store";
import { useProjectStore } from "@/stores/project-store";
import { toast } from "sonner";
import * as React from "react";

const MAX_AMOUNT_DIGITS = 7;

const currencyOptions = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "INR", symbol: "₹" },
] as const;

const ProjectInfoModal: React.FC = () => {
  const isOpen = useModalStore((s) => s.modals.projectInfo);
  const setOpen = useModalStore((s) => s.set);

  const projectInfo = useProjectStore((s) => s.projectInfo);
  const setProjectInfo = useProjectStore((s) => s.setProjectInfo);

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    amount: String(projectInfo?.project_amount?.value ?? ""),
    currency: projectInfo?.project_amount?.code ?? "USD",
    referenceNumber: projectInfo?.reference_number ?? "",
  });

  React.useEffect(() => {
    setFormData({
      amount: String(projectInfo?.project_amount?.value ?? ""),
      currency: projectInfo?.project_amount?.code ?? "USD",
      referenceNumber: projectInfo?.reference_number ?? "",
    });
  }, [projectInfo]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/^0+(?!$)/, "");
    const [integerPart] = value.split(".");
    if (integerPart.length > MAX_AMOUNT_DIGITS) {
      toast.error(`Amount cannot exceed ${MAX_AMOUNT_DIGITS} digits.`);
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) return;
    setFormData((p) => ({ ...p, amount: value }));
  };

  const onSubmit = async () => {
    const [integerPart] = formData.amount.split(".");
    if (integerPart.length > MAX_AMOUNT_DIGITS) {
      toast.error(`Amount cannot exceed ${MAX_AMOUNT_DIGITS} digits.`);
      return;
    }
    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    const selectedCurrency = currencyOptions.find((c) => c.code === formData.currency);
    if (!selectedCurrency) {
      toast.error("Invalid currency selected.");
      return;
    }
    setLoading(true);
    try {
      setProjectInfo({
        project_amount: {
          code: selectedCurrency.code,
          symbol: selectedCurrency.symbol,
          value: numAmount,
        },
        reference_number: formData.referenceNumber,
      });
      toast.success("Project info updated successfully");
      setOpen("projectInfo", false);
    } catch (err) {
      toast.error("Failed to save changes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(o) => setOpen("projectInfo", o)}
      className="bg-white sm:max-w-md w-full p-0 overflow-hidden"
    >
      <div className="px-6 pt-6 pb-2 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Project amount</h2>
        <p className="text-sm text-gray-500 mt-1">Set currency, amount and reference number</p>
      </div>

      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.currency}
              onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              inputMode="numeric"
              maxLength={MAX_AMOUNT_DIGITS + 5}
              className="h-10"
            />
            <div className="text-[11px] text-gray-400">Max {MAX_AMOUNT_DIGITS} digits</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ref">Reference number</Label>
          <Input
            id="ref"
            value={formData.referenceNumber}
            onChange={(e) => setFormData((p) => ({ ...p, referenceNumber: e.target.value }))}
            placeholder="Enter reference number"
            className="h-10"
          />
        </div>

        <div className="pt-1">
          <Button disabled={loading} className="w-full h-10" onClick={onSubmit}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectInfoModal;

