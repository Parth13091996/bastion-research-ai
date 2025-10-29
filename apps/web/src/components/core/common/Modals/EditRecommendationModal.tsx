import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../api/axios"; // Adjust path as needed
import { endpoints } from "@/api/endpoints"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define interfaces for JSONB fields
interface UpdateItem {
  date: string;
  title: string;
  description: string;
  pdf_url: string;
}

// Extended type
type ExtendedRecommendationRecord = {
  id: number;
  companyName: string;
  nseSymbol: string;
  dateRecommended: string;
  priceAtRecommendation: string;
  dateExit?: string;
  holdingPeriod?: string;
  cmpOrExitPrice: string;
  percentReturn?: string;
  action: string;
  targetPrice?: string;
  upsidePotential?: string;
  latestMcapCr?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
  created_at?: string;
};

// Updated Zod schema to include new fields
const recommendationSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  nseSymbol: z.string().min(1, "NSE Symbol is required"),
  dateRecommended: z.string().min(1, "Date Recommended is required"),
  priceAtRecommendation: z
    .string()
    .min(1, "Price at Recommendation is required"),
  dateExit: z.string().optional(),
  holdingPeriod: z.string().optional(),
  cmpOrExitPrice: z.string().min(1, "CMP/Exit Price is required"),
  percentReturn: z.string().optional(),
  action: z.string().min(1, "Action is required"),
  targetPrice: z.string().optional(),
  upsidePotential: z.string().optional(),
  latestMcapCr: z.string().optional(),
  business_note: z.string().optional(),
  quick_bite: z.string().optional(),
  video: z.string().optional(),
  exit_rationale: z.string().optional(),
  quarterly_update: z.string().optional(),
  announcements_and_update: z.string().optional(),
  // created_at not editable
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

interface EditRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  record: ExtendedRecommendationRecord | null;
}

const EditRecommendationModal: React.FC<EditRecommendationModalProps> = ({
  open,
  onClose,
  record,
}) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
  });

  useEffect(() => {
    if (open && record) {
      reset({
        ...record,
        quarterly_update: JSON.stringify(record.quarterly_update || []),
        announcements_and_update: JSON.stringify(
          record.announcements_and_update || []
        ),
      });
    } else if (!open) {
      reset();
    }
  }, [open, record, reset]);

  const mutation = useMutation({
    mutationFn: (data: RecommendationFormValues) => {
      if (!record?.id) {
        throw new Error("Record ID is required");
      }
      // Parse JSON fields
      const updatedData = {
        ...data,
        quarterly_update: JSON.parse(data.quarterly_update || "[]"),
        announcements_and_update: JSON.parse(
          data.announcements_and_update || "[]"
        ),
      };
      return axiosInstance.put(
        `${endpoints.recommendations.base}/${record.id}`,
        updatedData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      onClose();
      reset();
    },
    onError: (error: any) => {
      console.error("Update error:", error);
    },
  });

  const onSubmit = (data: RecommendationFormValues) => {
    mutation.mutate(data);
  };

  if (!record) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-6xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Recommendation
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Update the recommendation details. Required fields are marked with
            *. JSON fields should be valid JSON arrays.
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label>Company Name *</label>
              <Input {...register("companyName")} />
              {errors.companyName && (
                <p className="text-red-500 text-sm">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div>
              <label>NSE Symbol *</label>
              <Input {...register("nseSymbol")} />
              {errors.nseSymbol && (
                <p className="text-red-500 text-sm">
                  {errors.nseSymbol.message}
                </p>
              )}
            </div>
            <div>
              <label>Date Recommended *</label>
              <Input type="date" {...register("dateRecommended")} />
              {errors.dateRecommended && (
                <p className="text-red-500 text-sm">
                  {errors.dateRecommended.message}
                </p>
              )}
            </div>
            <div>
              <label>Price at Recommendation *</label>
              <Input
                type="number"
                step="0.01"
                {...register("priceAtRecommendation")}
              />
              {errors.priceAtRecommendation && (
                <p className="text-red-500 text-sm">
                  {errors.priceAtRecommendation.message}
                </p>
              )}
            </div>
            <div>
              <label>Date Exit</label>
              <Input type="date" {...register("dateExit")} />
            </div>
            <div>
              <label>Holding Period</label>
              <Input {...register("holdingPeriod")} />
            </div>
            <div>
              <label>CMP/Exit Price *</label>
              <Input
                type="number"
                step="0.01"
                {...register("cmpOrExitPrice")}
              />
              {errors.cmpOrExitPrice && (
                <p className="text-red-500 text-sm">
                  {errors.cmpOrExitPrice.message}
                </p>
              )}
            </div>
            <div>
              <label>% Return</label>
              <Input type="number" step="0.01" {...register("percentReturn")} />
            </div>
            <div>
              <label>Action *</label>
              <Input {...register("action")} />
              {errors.action && (
                <p className="text-red-500 text-sm">{errors.action.message}</p>
              )}
            </div>
            <div>
              <label>Target Price</label>
              <Input type="number" step="0.01" {...register("targetPrice")} />
            </div>
            <div>
              <label>Upside Potential</label>
              <Input
                type="number"
                step="0.01"
                {...register("upsidePotential")}
              />
            </div>
            <div className="md:col-span-2">
              <label>Latest Mcap (Rs. Cr)</label>
              <Input type="number" {...register("latestMcapCr")} />
            </div>
            <div>
              <label>Business Note (PDF URL)</label>
              <Input {...register("business_note")} />
            </div>
            <div>
              <label>Quick Bite (PDF URL)</label>
              <Input {...register("quick_bite")} />
            </div>
            <div>
              <label>Video (URL)</label>
              <Input {...register("video")} />
            </div>
            <div>
              <label>Exit Rationale (PDF URL)</label>
              <Input {...register("exit_rationale")} />
            </div>
            <div className="md:col-span-2">
              <label>Quarterly Update (JSON)</label>
              <Textarea {...register("quarterly_update")} rows={5} />
              {errors.quarterly_update && (
                <p className="text-red-500 text-sm">
                  {errors.quarterly_update.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label>Announcements and Update (JSON)</label>
              <Textarea {...register("announcements_and_update")} rows={5} />
              {errors.announcements_and_update && (
                <p className="text-red-500 text-sm">
                  {errors.announcements_and_update.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2 text-sm text-gray-500">
              <label>Created At</label>
              <Input value={record.created_at || ""} readOnly />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Recommendation"}
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-red-500 text-sm md:col-span-2">
                {mutation.error?.message || "Update failed"}
              </p>
            )}
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditRecommendationModal;
