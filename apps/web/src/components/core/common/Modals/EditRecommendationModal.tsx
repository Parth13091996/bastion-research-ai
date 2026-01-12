import { uploadFile } from "@/api/files-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Edit2, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
// --- Patch for Radix Select & Dialog stacking issue ---
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated: Add required validations for logo, business_note, tags
const recommendationSchema = z.object({
  nseSymbol: z.string().min(1, "Symbol is required"),
  dateRecommended: z.string().optional(),
  priceAtRecommendation: z.string().optional(),
  dateExit: z.string().optional(),
  holdingPeriod: z.string().optional(),
  cmpOrExitPrice: z.string().optional(),
  percentReturn: z.string().optional(),
  action: z.string().optional(),
  targetPrice: z.string().optional(),
  upsidePotential: z.string().optional(),
  latestMcapCr: z.string().optional(),
  logo: z.string().min(1, "Company Logo is required"),
  business_note: z.string().min(1, "Business Note (PDF) is required"),
  quick_bite: z.string().optional(),
  video: z.string().optional(),
  // Stock performance URLs are managed as an array via local state
  stock_performance_url: z.any().optional(),
  exit_rationale: z.string().optional(),
  quarterly_update: z.string().optional(),
  announcements_and_update: z.string().optional(),
  tags: z.string().min(1, "Tags is required"),
});

const parseNumericField = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const cleaned = typeof value === "number" ? value : String(value).replace(/,/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toInputValue = (value?: string | number | null) =>
  value !== undefined && value !== null ? String(value) : "";

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

interface EditRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  recommendation: ExtendedRecommendationRecord | null;
  onSave: (data: Partial<ExtendedRecommendationRecord>) => Promise<void>;
}

const EditRecommendationModal: React.FC<EditRecommendationModalProps> = ({
  open,
  onClose,
  recommendation: record,
  onSave,
}) => {
  const [uploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [quarterlyUpdates, setQuarterlyUpdates] = useState<UpdateItem[]>([]);
  const [announcements, setAnnouncements] = useState<UpdateItem[]>([]);
  const [stockPerformanceItems, setStockPerformanceItems] = useState<
    StockPerformanceItem[]
  >([]);
  const [editingQuarterly, setEditingQuarterly] = useState<number | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(
    null
  );
  const [selectedIterationIndex, setSelectedIterationIndex] =
    useState<number>(0);
  const [iterationResourceUploading, setIterationResourceUploading] = useState<
    Record<string, boolean>
  >({});
  const [iterationQuarterlyUploading, setIterationQuarterlyUploading] =
    useState<Record<string, boolean>>({});

  // Track uploading states for each quarterly update and announcement PDF
  const [quarterlyUploading, setQuarterlyUploading] = useState<
    Record<number, boolean>
  >({});
  const [announcementUploading, setAnnouncementUploading] = useState<
    Record<number, boolean>
  >({});

  // --- refs for file input fields (per file field for single main fields) ---
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const businessNoteInputRef = useRef<HTMLInputElement | null>(null);
  const quickBiteInputRef = useRef<HTMLInputElement | null>(null);
  const exitRationaleInputRef = useRef<HTMLInputElement | null>(null);
  const iterationBusinessNoteInputRef = useRef<HTMLInputElement | null>(null);
  const iterationQuickBiteInputRef = useRef<HTMLInputElement | null>(null);
  const iterationExitRationaleInputRef = useRef<HTMLInputElement | null>(null);

  // --- refs for file input fields for dynamically generated items (quarterly/announcements) ---
  const quarterlyPdfInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const announcementPdfInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const iterationQuarterlyPdfInputRefs = useRef<Array<HTMLInputElement | null>>(
    []
  );

  // Clear multilist refs before rendering to align length
  quarterlyPdfInputRefs.current = [];
  announcementPdfInputRefs.current = [];
  iterationQuarterlyPdfInputRefs.current = [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
  });

  // Track local error for file fields required check
  const [localError, setLocalError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && record) {
      reset({
        nseSymbol: record.nseSymbol || "",
        dateRecommended: record.dateRecommended || "",
        priceAtRecommendation: String(record.priceAtRecommendation || ""),
        dateExit: record.dateExit || "",
        holdingPeriod: record.holdingPeriod || "",
        cmpOrExitPrice: String(record.cmpOrExitPrice || ""),
        percentReturn: String(record.percentReturn || ""),
        action: record.action || "",
        targetPrice: String(record.targetPrice || ""),
        upsidePotential: String(record.upsidePotential || ""),
        latestMcapCr: String(record.latestMcapCr || ""),
        logo: (record as any).logo || "",
        business_note: record.business_note || "",
        quick_bite: record.quick_bite || "",
        video: record.video || "",
        exit_rationale: record.exit_rationale || "",
        tags: (record as any).tags || "",
      });
      setQuarterlyUpdates(record.quarterly_update || []);
      setAnnouncements(record.announcements_and_update || []);
      // Normalize stock_performance_url into an array of objects
      const sp = (record as any).stock_performance_url;
      if (Array.isArray(sp)) {
      setStockPerformanceItems(
        sp.map((item: any) => ({
          date: item?.date || "",
          title: item?.title || "",
          stock_recommendation_url:
            item?.stock_recommendation_url || item?.url || "",
          business_note: item?.business_note || "",
          quick_bite: item?.quick_bite || "",
          video: item?.video || "",
          exit_rationale: item?.exit_rationale || "",
          quarterly_update: Array.isArray(item?.quarterly_update)
            ? item.quarterly_update
            : [],
          announcements_and_update: Array.isArray(item?.announcements_and_update)
            ? item.announcements_and_update
            : [],
          dateRecommended:
            item?.dateRecommended || record?.dateRecommended || "",
          priceAtRecommendation:
            item?.priceAtRecommendation ?? record?.priceAtRecommendation ?? "",
          dateExit: item?.dateExit || record?.dateExit || "",
          holdingPeriod: item?.holdingPeriod || record?.holdingPeriod || "",
          cmpOrExitPrice:
            item?.cmpOrExitPrice ?? record?.cmpOrExitPrice ?? "",
          percentReturn: item?.percentReturn ?? record?.percentReturn ?? "",
        }))
      );
    } else if (typeof sp === "string" && sp.trim() !== "") {
      setStockPerformanceItems([
        {
          date: record.dateRecommended || "",
          title: "Initial recommendation",
          stock_recommendation_url: sp,
          quarterly_update: Array.isArray(record.quarterly_update)
            ? record.quarterly_update
            : [],
          announcements_and_update: Array.isArray(record.announcements_and_update)
            ? record.announcements_and_update
            : [],
          dateRecommended: record.dateRecommended || "",
          priceAtRecommendation: record.priceAtRecommendation || "",
          dateExit: record.dateExit || "",
          holdingPeriod: record.holdingPeriod || "",
          cmpOrExitPrice: record.cmpOrExitPrice || "",
          percentReturn: record.percentReturn || "",
        },
      ]);
    } else {
        setStockPerformanceItems([]);
      }
      setSelectedIterationIndex(0);
      setIterationResourceUploading({});
      setIterationQuarterlyUploading({});
      setLocalError({});
    } else if (!open) {
      reset();
      setQuarterlyUpdates([]);
      setAnnouncements([]);
      setStockPerformanceItems([]);
      setLocalError({});
      setSelectedIterationIndex(0);
      setIterationResourceUploading({});
      setIterationQuarterlyUploading({});
    }
  }, [open, record, reset]);

  useEffect(() => {
    setSelectedIterationIndex((prev) => {
      if (stockPerformanceItems.length === 0) return 0;
      return Math.min(prev, stockPerformanceItems.length - 1);
    });
  }, [stockPerformanceItems.length]);

  // Collect file locally; send with main FormData on submit
  const handleFileSelect = (fieldName: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    // Store a display value (filename) to show in the input
    setValue(fieldName as any, file.name as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setLocalError((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleIterationResourceUpload = async (
    field: "business_note" | "quick_bite" | "exit_rationale",
    file: File
  ) => {
    const companySymbol = record?.nseSymbol || "unknown";
    const iterationIndex = selectedIterationIndex;
    try {
      setIterationResourceUploading((prev) => ({
        ...prev,
        [`${field}:${iterationIndex}`]: true,
      }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${field}_iter_${iterationIndex}`);
      formData.append("category", "pdf");
      formData.append(
        "dir",
        `recommendations/${companySymbol}/iterations/${iterationIndex}`
      );
      const response = await uploadFile(formData);
      setStockPerformanceItems((prev) => {
        const next = [...prev];
        if (!next[iterationIndex]) return prev;
        next[iterationIndex] = { ...next[iterationIndex], [field]: response.data.url };
        return next;
      });
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setIterationResourceUploading((prev) => ({
        ...prev,
        [`${field}:${iterationIndex}`]: false,
      }));
      if (field === "business_note" && iterationBusinessNoteInputRef.current)
        iterationBusinessNoteInputRef.current.value = "";
      if (field === "quick_bite" && iterationQuickBiteInputRef.current)
        iterationQuickBiteInputRef.current.value = "";
      if (field === "exit_rationale" && iterationExitRationaleInputRef.current)
        iterationExitRationaleInputRef.current.value = "";
    }
  };

  const updateIterationField = (
    field: keyof StockPerformanceItem,
    value: string
  ) => {
    const iterationIndex = selectedIterationIndex;
    setStockPerformanceItems((prev) => {
      const next = [...prev];
      if (!next[iterationIndex]) return prev;
      next[iterationIndex] = { ...next[iterationIndex], [field]: value };
      return next;
    });
  };

  const updatePrimaryIterationField = (
    field: keyof StockPerformanceItem,
    value: string
  ) => {
    setStockPerformanceItems((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      next[0] = { ...next[0], [field]: value };
      return next;
    });
  };

  const getIterationQuarterlyUpdates = (iterationIndex: number) =>
    Array.isArray(stockPerformanceItems?.[iterationIndex]?.quarterly_update)
      ? (stockPerformanceItems[iterationIndex].quarterly_update as UpdateItem[])
      : [];

  const setIterationQuarterlyUpdates = (
    iterationIndex: number,
    nextUpdates: UpdateItem[]
  ) => {
    setStockPerformanceItems((prev) => {
      const next = [...prev];
      if (!next[iterationIndex]) return prev;
      next[iterationIndex] = { ...next[iterationIndex], quarterly_update: nextUpdates };
      return next;
    });
  };

  const handleIterationQuarterlyPdfUpload = async (
    iterationIndex: number,
    index: number,
    file: File
  ) => {
    try {
      const uploadKey = `${iterationIndex}:${index}`;
      setIterationQuarterlyUploading((prev) => ({ ...prev, [uploadKey]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `quarterly_update_pdf_${iterationIndex}_${index}`);
      formData.append("category", "pdf");
      const companySymbol = record?.nseSymbol || "unknown";
      formData.append(
        "dir",
        `recommendations/${companySymbol}/iterations/${iterationIndex}/quarterly_updates`
      );
      const response = await uploadFile(formData);
      const updates = getIterationQuarterlyUpdates(iterationIndex);
      const nextUpdates = [...updates];
      nextUpdates[index] = { ...nextUpdates[index], pdf_url: response.data.url };
      setIterationQuarterlyUpdates(iterationIndex, nextUpdates);
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      const uploadKey = `${iterationIndex}:${index}`;
      setIterationQuarterlyUploading((prev) => ({ ...prev, [uploadKey]: false }));
      if (iterationQuarterlyPdfInputRefs.current[index]) {
        iterationQuarterlyPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  // Updated: Pass fileName parameter as field name for backend recognition
  const handleQuarterlyPdfUpload = async (index: number, file: File) => {
    try {
      setQuarterlyUploading((prev) => ({ ...prev, [index]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", "quarterly_update_pdf_url_" + index);
      formData.append("category", "pdf");
      const companySymbol = record?.nseSymbol || "unknown";
      formData.append(
        "dir",
        `recommendations/${companySymbol}/quarterly_updates`
      );
      const response = await uploadFile(formData);
      // Set the url to quarterly update item
      const newUpdates = [...quarterlyUpdates];
      newUpdates[index] = { ...newUpdates[index], pdf_url: response.data.url };
      setQuarterlyUpdates(newUpdates);
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setQuarterlyUploading((prev) => ({ ...prev, [index]: false }));

      // Clear the input after upload
      if (
        quarterlyPdfInputRefs.current &&
        quarterlyPdfInputRefs.current[index]
      ) {
        quarterlyPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  // Updated: Pass fileName as field name for backend recognition for each announcement item
  const handleAnnouncementPdfUpload = async (index: number, file: File) => {
    try {
      setAnnouncementUploading((prev) => ({ ...prev, [index]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", "announcement_pdf_url_" + index);
      formData.append("category", "pdf");
      const companySymbol = record?.nseSymbol || "unknown";
      formData.append(
        "dir",
        `recommendations/${companySymbol}/announcements_and_update`
      );
      const response = await uploadFile(formData);
      // Set the url to announcement item
      const newAnnouncements = [...announcements];
      newAnnouncements[index] = {
        ...newAnnouncements[index],
        pdf_url: response.data.url,
      };
      setAnnouncements(newAnnouncements);
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setAnnouncementUploading((prev) => ({ ...prev, [index]: false }));

      // Clear the input after upload
      if (
        announcementPdfInputRefs.current &&
        announcementPdfInputRefs.current[index]
      ) {
        announcementPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleAddQuarterlyUpdate = () => {
    setQuarterlyUpdates([
      ...quarterlyUpdates,
      { date: "", title: "", description: "", pdf_url: "" },
    ]);
    setEditingQuarterly(quarterlyUpdates.length);
  };

  const handleRemoveQuarterlyUpdate = (index: number) => {
    setQuarterlyUpdates(quarterlyUpdates.filter((_, i) => i !== index));
    if (editingQuarterly === index) setEditingQuarterly(null);
  };

  const handleUpdateQuarterlyUpdate = (
    index: number,
    field: keyof UpdateItem,
    value: string
  ) => {
    const updated = [...quarterlyUpdates];
    updated[index] = { ...updated[index], [field]: value };
    setQuarterlyUpdates(updated);
  };

  const handleAddAnnouncement = () => {
    setAnnouncements([
      ...announcements,
      { date: "", title: "", description: "", pdf_url: "" },
    ]);
    setEditingAnnouncement(announcements.length);
  };

  const handleRemoveAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
    if (editingAnnouncement === index) setEditingAnnouncement(null);
  };

  const handleUpdateAnnouncement = (
    index: number,
    field: keyof UpdateItem,
    value: string
  ) => {
    const updated = [...announcements];
    updated[index] = { ...updated[index], [field]: value };
    setAnnouncements(updated);
  };

  // Custom validation for required file fields before submit
  const validateFileFields = () => {
    const errors: Record<string, string> = {};

    // For logo: user must have selected/uploaded a file (selectedFiles.logo), or existing record logo should be present
    if (
      (!selectedFiles.logo && !watch("logo")) ||
      (typeof watch("logo") === "string" && watch("logo").trim() === "")
    ) {
      errors.logo = "Company Logo is required";
    }

    // For business_note: must have selected/uploaded a file or have a value
    if (
      (!selectedFiles.business_note && !watch("business_note")) ||
      (typeof watch("business_note") === "string" &&
        watch("business_note").trim() === "")
    ) {
      errors.business_note = "Business Note (PDF) is required";
    }

    // For stock_performance_url
    if (
      !stockPerformanceItems.length ||
      stockPerformanceItems.some(
        (item) =>
          !item.date.trim() ||
          !item.title.trim() ||
          !item.stock_recommendation_url.trim()
      )
    ) {
      errors.stock_performance_url =
        "At least one complete performance URL (date, title, URL) is required";
    }

    // For tags
    if (!watch("tags") || watch("tags").trim() === "") {
      errors.tags = "Tags is required";
    }

    setLocalError(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: RecommendationFormValues) => {
    // Validate required file fields first
    const valid = await trigger(); // Perform zod validation first (shows error messages)
    const validatedFiles = validateFileFields();
    if (!valid || !validatedFiles) {
      // Show warning for missing client-side required fields
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("company_symbol", record.nseSymbol || "");
      formData.append("video", data.video || "");
      const stockPerformancePayload = stockPerformanceItems.map((item, index) => {
        if (index !== 0) {
          return item;
        }
        return {
          ...item,
          dateRecommended:
            data.dateRecommended ||
            item.dateRecommended ||
            record.dateRecommended ||
            "",
          priceAtRecommendation:
            parseNumericField(
              data.priceAtRecommendation ??
                item.priceAtRecommendation ??
                record.priceAtRecommendation
            ) ?? undefined,
          dateExit:
            data.dateExit || item.dateExit || record.dateExit || "",
          holdingPeriod:
            data.holdingPeriod ||
            item.holdingPeriod ||
            record.holdingPeriod ||
            "",
          cmpOrExitPrice:
            parseNumericField(
              data.cmpOrExitPrice ??
                item.cmpOrExitPrice ??
                record.cmpOrExitPrice
            ) ?? undefined,
          percentReturn:
            parseNumericField(
              data.percentReturn ?? item.percentReturn ?? record.percentReturn
            ) ?? undefined,
          business_note:
            (data.business_note || item.business_note || record.business_note) ??
            "",
          quick_bite:
            (data.quick_bite || item.quick_bite || record.quick_bite) ?? "",
          video: (data.video || item.video || record.video) ?? "",
          exit_rationale:
            (data.exit_rationale ||
              item.exit_rationale ||
              record.exit_rationale) ??
            "",
          quarterly_update: quarterlyUpdates,
          announcements_and_update: announcements,
        };
      });
      formData.append("stock_performance_url", JSON.stringify(stockPerformancePayload));
      formData.append("quarterly_update", JSON.stringify(quarterlyUpdates));
      formData.append(
        "announcements_and_update",
        JSON.stringify(announcements)
      );
      if (data.tags) {
        formData.append("tags", String(data.tags));
      }

      // For required file fields, always attach the actual selected files, not just the name
      if (selectedFiles.logo) {
        formData.append("logo", selectedFiles.logo);
      }
      if (selectedFiles.business_note) {
        formData.append("business_note", selectedFiles.business_note);
      }
      if (selectedFiles.quick_bite)
        formData.append("quick_bite", selectedFiles.quick_bite);
      if (selectedFiles.exit_rationale)
        formData.append("exit_rationale", selectedFiles.exit_rationale);

      await onSave(formData as any);
    } catch (error: any) {
      console.error("Update error:", error);
    }
  };

  if (!record) return null;

  const TAG_OPTIONS = [
    { label: "Core (Quarterly)", value: "core" },
    { label: "Core Annual", value: "core_annual" },
    { label: "Research Ally", value: "research_hub" },
    { label: "Freemium", value: "freemium" },
  ];

  const handleTagsChange = (value: string) => {
    setValue("tags", value, { shouldValidate: true, shouldDirty: true });
    setLocalError((prev) => ({ ...prev, tags: "" }));
  };

  const primaryIteration = stockPerformanceItems[0] || {};
  const isExitRecommendation =
    !!record &&
    !!record.action &&
    ["exit", "exited"].includes(record.action.trim().toLowerCase());

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-6xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto  z-[99999]">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Recommendation - {record.nseSymbol}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Update additional fields for this recommendation. Sheet data
            (symbol, prices, etc.) is read-only. Upload PDFs and manage
            quarterly updates and announcements.
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-6"
            noValidate
          >
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Sheet Data (Read-Only)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Symbol:</label>
                  <p className="font-medium">{record.nseSymbol}</p>
                </div>
                <div>
                  <label className="text-gray-600">Action:</label>
                  <p className="font-medium">{record.action}</p>
                </div>
                <div>
                  <label className="text-gray-600">% Return:</label>
                  <p className="font-medium">
                    {Math.round(Number(record?.percentReturn) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {isExitRecommendation && (
              <div className="bg-white border border-gray-200 p-4 rounded-md space-y-4">
                <div>
                  <h3 className="text-base font-medium">Persist Exit Details</h3>
                  <p className="text-xs text-gray-500">
                    Store the recommendation & exit snapshot inside the primary performance iteration for future reference.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recommendation Date
                    </label>
                    <Input
                      type="date"
                      value={
                        // Use ISO yyyy-MM-dd for <input type="date" />
                        primaryIteration.dateRecommended
                          ? (() => {
                              // If already in yyyy-MM-dd return as is, else try to parse
                              const val = primaryIteration.dateRecommended;
                              // If it's already ISO 8601 date string:
                              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                              // Try parsing "Thursday, 15 May, 2025" or similar
                              const parsed = new Date(val);
                              if (!isNaN(parsed.getTime()))
                                return parsed.toISOString().slice(0, 10);
                              return "";
                            })()
                          : record.dateRecommended
                          ? (() => {
                              const val = record.dateRecommended;
                              if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                              const parsed = new Date(val);
                              if (!isNaN(parsed.getTime()))
                                return parsed.toISOString().slice(0, 10);
                              return "";
                            })()
                          : ""
                      }
                      onChange={e =>
                        updatePrimaryIterationField(
                          "dateRecommended",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recommendation Price
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={toInputValue(
                        primaryIteration.priceAtRecommendation ??
                          record.priceAtRecommendation
                      )}
                      onChange={(e) =>
                        updatePrimaryIterationField(
                          "priceAtRecommendation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Exit Date
                    </label>
                    <Input
                      type="date"
                      value={
                        primaryIteration.dateExit || record.dateExit || ""
                      }
                      onChange={(e) =>
                        updatePrimaryIterationField("dateExit", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Exit Price
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={toInputValue(
                        primaryIteration.cmpOrExitPrice ?? record.cmpOrExitPrice
                      )}
                      onChange={(e) =>
                        updatePrimaryIterationField(
                          "cmpOrExitPrice",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Holding Period
                    </label>
                    <Input
                      value={
                        primaryIteration.holdingPeriod ||
                        record.holdingPeriod ||
                        ""
                      }
                      onChange={(e) =>
                        updatePrimaryIterationField(
                          "holdingPeriod",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Total Return (%)
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={toInputValue(
                        primaryIteration.percentReturn ?? record.percentReturn
                      )}
                      onChange={(e) =>
                        updatePrimaryIterationField(
                          "percentReturn",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Logo & Documents</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Company Logo (Image URL){" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register("logo")}
                      placeholder="Logo file or name"
                      className={
                        localError.logo || errors.logo ? "border-red-500" : ""
                      }
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading.logo}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading.logo ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect("logo", file);
                        }}
                      />
                    </label>
                  </div>
                  {(localError.logo || errors.logo) && (
                    <div className="text-xs text-red-600 mt-1">
                      {localError.logo || errors.logo?.message}
                    </div>
                  )}
                  {watch("logo") && selectedFiles.logo && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600">
                        {selectedFiles.logo.name}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Note (PDF) <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register("business_note")}
                      placeholder="PDF file or name"
                      className={
                        localError.business_note || errors.business_note
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading.business_note}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading.business_note ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={businessNoteInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect("business_note", file);
                        }}
                      />
                    </label>
                  </div>
                  {(localError.business_note || errors.business_note) && (
                    <div className="text-xs text-red-600 mt-1">
                      {localError.business_note ||
                        errors.business_note?.message}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quick Bite (PDF)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register("quick_bite")}
                      placeholder="PDF file or name"
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading.quick_bite}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading.quick_bite ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={quickBiteInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect("quick_bite", file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exit Rationale (PDF)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register("exit_rationale")}
                      placeholder="PDF file or name"
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading.exit_rationale}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading.exit_rationale ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={exitRationaleInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect("exit_rationale", file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video URL
                  </label>
                  <Input {...register("video")} placeholder="Video URL" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Performance URLs{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStockPerformanceItems((prev) => [
                          ...prev,
                          {
                            date: "",
                            title: "",
                            stock_recommendation_url: "",
                            quarterly_update: [],
                            announcements_and_update: [],
                          },
                        ])
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Performance URL
                    </Button>
                    {stockPerformanceItems.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No performance URLs added yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Performance URL</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockPerformanceItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={item.date}
                                  onChange={(e) =>
                                    setStockPerformanceItems((prev) => {
                                      const next = [...prev];
                                      next[index] = {
                                        ...next[index],
                                        date: e.target.value,
                                      };
                                      return next;
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Title"
                                  value={item.title}
                                  onChange={(e) =>
                                    setStockPerformanceItems((prev) => {
                                      const next = [...prev];
                                      next[index] = {
                                        ...next[index],
                                        title: e.target.value,
                                      };
                                      return next;
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Performance URL"
                                  value={item.stock_recommendation_url}
                                  onChange={(e) =>
                                    setStockPerformanceItems((prev) => {
                                      const next = [...prev];
                                      next[index] = {
                                        ...next[index],
                                        stock_recommendation_url:
                                          e.target.value,
                                      };
                                      return next;
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() =>
                                    setStockPerformanceItems((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                  {(localError.stock_performance_url ||
                    errors.stock_performance_url) && (
                    <div className="text-xs text-red-600 mt-1">
                      {localError.stock_performance_url ||
                        errors.stock_performance_url?.message}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags <span className="text-red-600">*</span>
                  </label>
                  <Select
                    onValueChange={handleTagsChange}
                    value={watch("tags")}
                  >
                    <SelectTrigger
                      className={`w-[180px] ${localError.tags || errors.tags ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      sideOffset={4}
                      style={{ zIndex: 1000001 }}
                    >
                      <SelectGroup>
                        <SelectLabel>Select a Tag</SelectLabel>
                        {TAG_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {(localError.tags || errors.tags) && (
                    <div className="text-xs text-red-600 mt-1">
                      {localError.tags || errors.tags?.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {stockPerformanceItems.length > 1 && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-lg">Iteration Details</h3>
                    <p className="text-sm text-gray-600">
                      Optional overrides per performance URL (useful for re-recommendations).
                    </p>
                  </div>
                  <div className="w-full md:w-80">
                    <label className="block text-sm font-medium mb-2">
                      Select Iteration
                    </label>
                    <Select
                      value={String(selectedIterationIndex)}
                      onValueChange={(v) =>
                        setSelectedIterationIndex(parseInt(v, 10))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select iteration" />
                      </SelectTrigger>
                      <SelectContent style={{ zIndex: 1000001 }}>
                        {stockPerformanceItems.map((item, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {item.date || "No date"}{" "}
                            {item.title ? `- ${item.title}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedIterationIndex === 0 ? (
                  <p className="text-sm text-gray-600">
                    Primary iteration (0) uses the main resource fields and updates below.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Business Note (PDF)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={
                              stockPerformanceItems[selectedIterationIndex]
                                ?.business_note || ""
                            }
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <label className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={
                                !!iterationResourceUploading[
                                  `business_note:${selectedIterationIndex}`
                                ]
                              }
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                {iterationResourceUploading[
                                  `business_note:${selectedIterationIndex}`
                                ]
                                  ? "Uploading..."
                                  : "Upload"}
                              </span>
                            </Button>
                            <input
                              ref={iterationBusinessNoteInputRef}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleIterationResourceUpload(
                                    "business_note",
                                    file
                                  );
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Quick Bite (PDF)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={
                              stockPerformanceItems[selectedIterationIndex]
                                ?.quick_bite || ""
                            }
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <label className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={
                                !!iterationResourceUploading[
                                  `quick_bite:${selectedIterationIndex}`
                                ]
                              }
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                {iterationResourceUploading[
                                  `quick_bite:${selectedIterationIndex}`
                                ]
                                  ? "Uploading..."
                                  : "Upload"}
                              </span>
                            </Button>
                            <input
                              ref={iterationQuickBiteInputRef}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleIterationResourceUpload(
                                    "quick_bite",
                                    file
                                  );
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Exit Rationale (PDF)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={
                              stockPerformanceItems[selectedIterationIndex]
                                ?.exit_rationale || ""
                            }
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <label className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={
                                !!iterationResourceUploading[
                                  `exit_rationale:${selectedIterationIndex}`
                                ]
                              }
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                {iterationResourceUploading[
                                  `exit_rationale:${selectedIterationIndex}`
                                ]
                                  ? "Uploading..."
                                  : "Upload"}
                              </span>
                            </Button>
                            <input
                              ref={iterationExitRationaleInputRef}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleIterationResourceUpload(
                                    "exit_rationale",
                                    file
                                  );
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Video URL
                        </label>
                        <Input
                          value={
                            stockPerformanceItems[selectedIterationIndex]
                              ?.video || ""
                          }
                          onChange={(e) =>
                            updateIterationField("video", e.target.value)
                          }
                          placeholder="Video URL"
                        />
                      </div>
                    </div>

                    <details className="rounded-md border border-gray-200 bg-gray-50">
                      <summary className="cursor-pointer select-none px-4 py-3 font-medium text-sm text-gray-900">
                        Iteration Quarterly Updates
                      </summary>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Updates saved only for this iteration.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setIterationQuarterlyUpdates(
                                selectedIterationIndex,
                                [
                                  ...getIterationQuarterlyUpdates(
                                    selectedIterationIndex
                                  ),
                                  {
                                    date: "",
                                    title: "",
                                    description: "",
                                    pdf_url: "",
                                  },
                                ]
                              )
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        {getIterationQuarterlyUpdates(selectedIterationIndex)
                          .length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No quarterly updates for this iteration.
                          </div>
                        ) : (
                          <div className="border rounded-md bg-white overflow-x-auto">
                            <div className="max-h-72 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[140px]">
                                      Date
                                    </TableHead>
                                    <TableHead className="w-[220px]">
                                      Title
                                    </TableHead>
                                    <TableHead className="min-w-[280px]">
                                      Description
                                    </TableHead>
                                    <TableHead className="min-w-[240px]">
                                      PDF
                                    </TableHead>
                                    <TableHead className="w-[120px] text-center">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getIterationQuarterlyUpdates(
                                    selectedIterationIndex
                                  ).map((update, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Input
                                          type="date"
                                          value={update.date}
                                          onChange={(e) => {
                                            const next = [
                                              ...getIterationQuarterlyUpdates(
                                                selectedIterationIndex
                                              ),
                                            ];
                                            next[index] = {
                                              ...next[index],
                                              date: e.target.value,
                                            };
                                            setIterationQuarterlyUpdates(
                                              selectedIterationIndex,
                                              next
                                            );
                                          }}
                                          className="text-sm"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          value={update.title}
                                          onChange={(e) => {
                                            const next = [
                                              ...getIterationQuarterlyUpdates(
                                                selectedIterationIndex
                                              ),
                                            ];
                                            next[index] = {
                                              ...next[index],
                                              title: e.target.value,
                                            };
                                            setIterationQuarterlyUpdates(
                                              selectedIterationIndex,
                                              next
                                            );
                                          }}
                                          placeholder="Title"
                                          className="text-sm"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Textarea
                                          value={update.description}
                                          onChange={(e) => {
                                            const next = [
                                              ...getIterationQuarterlyUpdates(
                                                selectedIterationIndex
                                              ),
                                            ];
                                            next[index] = {
                                              ...next[index],
                                              description: e.target.value,
                                            };
                                            setIterationQuarterlyUpdates(
                                              selectedIterationIndex,
                                              next
                                            );
                                          }}
                                          placeholder="Description"
                                          rows={2}
                                          className="text-sm min-w-[260px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2 items-center">
                                          <label className="cursor-pointer">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              disabled={
                                                iterationQuarterlyUploading[
                                                  `${selectedIterationIndex}:${index}`
                                                ]
                                              }
                                              asChild
                                            >
                                              <span>
                                                <Upload className="h-4 w-4 mr-1" />
                                                {iterationQuarterlyUploading[
                                                  `${selectedIterationIndex}:${index}`
                                                ]
                                                  ? "Uploading..."
                                                  : "Upload"}
                                              </span>
                                            </Button>
                                            <input
                                              ref={(el) => {
                                                iterationQuarterlyPdfInputRefs.current[
                                                  index
                                                ] = el;
                                              }}
                                              type="file"
                                              accept="application/pdf"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file)
                                                  handleIterationQuarterlyPdfUpload(
                                                    selectedIterationIndex,
                                                    index,
                                                    file
                                                  );
                                              }}
                                            />
                                          </label>
                                          {update.pdf_url && (
                                            <a
                                              href={update.pdf_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 underline"
                                            >
                                              View
                                            </a>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const next = getIterationQuarterlyUpdates(
                                              selectedIterationIndex
                                            ).filter((_, i) => i !== index);
                                            setIterationQuarterlyUpdates(
                                              selectedIterationIndex,
                                              next
                                            );
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  </>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">Quarterly Updates</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddQuarterlyUpdate}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Update
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  {quarterlyUpdates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No quarterly updates. Click "Add Update" to create one.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[180px]">Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[250px]">PDF URL</TableHead>
                          <TableHead className="w-[120px] text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quarterlyUpdates.map((update, index) => (
                          <TableRow key={index}>
                            {editingQuarterly === index ? (
                              <>
                                <TableCell>
                                  <Input
                                    type="date"
                                    value={update.date}
                                    onChange={(e) =>
                                      handleUpdateQuarterlyUpdate(
                                        index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={update.title}
                                    onChange={(e) =>
                                      handleUpdateQuarterlyUpdate(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Title"
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    value={update.description}
                                    onChange={(e) =>
                                      handleUpdateQuarterlyUpdate(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Description"
                                    rows={2}
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2 items-center">
                                    <label className="cursor-pointer">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={quarterlyUploading[index]}
                                        asChild
                                      >
                                        <span>
                                          <Upload className="h-4 w-4 mr-1" />
                                          {quarterlyUploading[index]
                                            ? "Uploading..."
                                            : "Upload"}
                                        </span>
                                      </Button>
                                      <input
                                        ref={(el) => {
                                          quarterlyPdfInputRefs.current[index] =
                                            el;
                                        }}
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            handleQuarterlyPdfUpload(
                                              index,
                                              file
                                            );
                                        }}
                                      />
                                    </label>
                                  </div>
                                  {update.pdf_url &&
                                    update.pdf_url.startsWith("http") && (
                                      <div className="mt-1 text-xs">
                                        <a
                                          href={update.pdf_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          Preview PDF
                                        </a>
                                      </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingQuarterly(null)}
                                  >
                                    Done
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="text-sm">
                                  {update.date || "-"}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {update.title || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  <div
                                    className="max-w-xs truncate"
                                    title={update.description}
                                  >
                                    {update.description || "-"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {update.pdf_url ? (
                                    <a
                                      href={update.pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline truncate block max-w-[180px]"
                                    >
                                      View PDF
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="text-center space-x-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingQuarterly(index)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      handleRemoveQuarterlyUpdate(index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-lg">
                    Announcements & Updates
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddAnnouncement}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Announcement
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No announcements. Click "Add Announcement" to create one.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[180px]">Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[250px]">PDF URL</TableHead>
                          <TableHead className="w-[120px] text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements.map((announcement, index) => (
                          <TableRow key={index}>
                            {editingAnnouncement === index ? (
                              <>
                                <TableCell>
                                  <Input
                                    type="date"
                                    value={announcement.date}
                                    onChange={(e) =>
                                      handleUpdateAnnouncement(
                                        index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={announcement.title}
                                    onChange={(e) =>
                                      handleUpdateAnnouncement(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Title"
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    value={announcement.description}
                                    onChange={(e) =>
                                      handleUpdateAnnouncement(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Description"
                                    rows={2}
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2 items-center">
                                    <label className="cursor-pointer">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={announcementUploading[index]}
                                        asChild
                                      >
                                        <span>
                                          <Upload className="h-4 w-4 mr-1" />
                                          {announcementUploading[index]
                                            ? "Uploading..."
                                            : "Upload"}
                                        </span>
                                      </Button>
                                      <input
                                        ref={(el) => {
                                          announcementPdfInputRefs.current[
                                            index
                                          ] = el;
                                        }}
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            handleAnnouncementPdfUpload(
                                              index,
                                              file
                                            );
                                        }}
                                      />
                                    </label>
                                  </div>
                                  {announcement.pdf_url &&
                                    announcement.pdf_url.startsWith("http") && (
                                      <div className="mt-1 text-xs">
                                        <a
                                          href={announcement.pdf_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          Preview PDF
                                        </a>
                                      </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingAnnouncement(null)}
                                  >
                                    Done
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="text-sm">
                                  {announcement.date || "-"}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {announcement.title || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  <div
                                    className="max-w-xs truncate"
                                    title={announcement.description}
                                  >
                                    {announcement.description || "-"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {announcement.pdf_url ? (
                                    <a
                                      href={announcement.pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline truncate block max-w-[180px]"
                                    >
                                      View PDF
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="text-center space-x-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setEditingAnnouncement(index)
                                    }
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      handleRemoveAnnouncement(index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
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
