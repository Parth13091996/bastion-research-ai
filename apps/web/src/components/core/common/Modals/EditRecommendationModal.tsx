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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Schema ---
// quick_bite is not part of flat schema, but is embedded in each StockPerformanceModel object
const recommendationSchema = z.object({
  nseSymbol: z.string().min(1, "Symbol is required"),
  action: z.string().optional(),
  percentReturn: z.string().optional(),
  logo: z.string().min(1, "Company Logo is required"),
  tags: z.string().min(1, "Tags is required"),
  business_note: z.string().optional().nullable(),
  video: z.string().optional(),
  exit_rationale: z.string().optional().nullable(),
  stock_performance_url: z.any(),
  quarterly_update: z.any().optional(),
  announcements_and_update: z.any().optional(),
  recommendation_date: z.string().optional(),
  recommendation_price: z.string().optional(),
  exit_price: z.string().optional(),
  exit_date: z.string().optional(),
  holding_period: z.string().optional(),
  total_return: z.string().optional(),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

interface EditRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  recommendation: ExtendedRecommendationRecord | null;
  onSave: (data: Partial<ExtendedRecommendationRecord> | FormData) => Promise<void>;
}

interface StockPerformanceModel {
  date: string;
  title: string;
  stock_recommendation_url: string;
  business_note?: string | null;
  quick_bite?: string | null;
  video?: string;
  exit_rationale?: string | null;
  quarterly_update?: UpdateItem[];
  recommendation_date?: string;
  recommendation_price?: string;
  exit_price?: string;
  exit_date?: string;
  holding_period?: string;
  total_return?: string;
  is_active?: boolean;
}

const EditRecommendationModal: React.FC<EditRecommendationModalProps> = ({
  open,
  onClose,
  recommendation: record,
  onSave,
}) => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [stockPerformance, setStockPerformance] = useState<StockPerformanceModel[]>([]);
  const [activePerformanceIndex, setActivePerformanceIndex] = useState(0);

  const [quarterlyUploading, setQuarterlyUploading] = useState<Record<number, boolean>>({});
  const [editingQuarterly, setEditingQuarterly] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<UpdateItem[]>([]);
  const [announcementUploading, setAnnouncementUploading] = useState<Record<number, boolean>>({});
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);

  const [isActive, setIsActive] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const businessNoteInputRef = useRef<HTMLInputElement | null>(null);
  const quickBiteInputRef = useRef<HTMLInputElement | null>(null);
  const exitRationaleInputRef = useRef<HTMLInputElement | null>(null);
  const quarterlyPdfInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const announcementPdfInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  quarterlyPdfInputRefs.current = [];
  announcementPdfInputRefs.current = [];

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

  const [localError, setLocalError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && record) {
      reset({
        nseSymbol: record.nseSymbol || "",
        action: record.action || "",
        percentReturn: record.percentReturn ? String(record.percentReturn) : "",
        logo: (record as any).logo || "",
        tags: (record as any).tags || "",
        recommendation_date: "",
        recommendation_price: "",
        exit_price: "",
        exit_date: "",
        holding_period: "",
        total_return: "",
      });

      let perf = [] as StockPerformanceModel[];
      const sp = (record as any).stock_performance_url;
      if (Array.isArray(sp)) {
        perf = sp.map((item: any, idx: number) => ({
          date: item?.date || "",
          title: item?.title || "",
          stock_recommendation_url: item?.stock_recommendation_url || item?.url || "",
          business_note: (typeof item?.business_note === "undefined" ? null : item?.business_note),
          quick_bite: (typeof item?.quick_bite === "undefined" ? null : item?.quick_bite),
          video: item?.video || "",
          exit_rationale: (typeof item?.exit_rationale === "undefined" ? null : item?.exit_rationale),
          quarterly_update: Array.isArray(item?.quarterly_update) ? item?.quarterly_update : [],
          recommendation_date: item?.recommendation_date || "",
          recommendation_price: item?.recommendation_price ?? "",
          exit_price: item?.exit_price ?? "",
          exit_date: item?.exit_date || "",
          holding_period: item?.holding_period ?? "",
          total_return: item?.total_return ?? "",
          is_active: !!item?.is_active,
        }));
      } else if (typeof sp === "string" && sp.trim() !== "") {
        perf = [{
          date: record?.dateRecommended || "",
          title: "Initial recommendation",
          stock_recommendation_url: sp,
          business_note: (typeof record?.business_note === "undefined" ? null : record?.business_note),
          quick_bite: (typeof record?.quick_bite === "undefined" ? null : record?.quick_bite),
          video: record?.video || "",
          exit_rationale: (typeof record?.exit_rationale === "undefined" ? null : record?.exit_rationale),
          quarterly_update: Array.isArray(record.quarterly_update) ? record.quarterly_update : [],
          recommendation_date: (record as any).recommendation_date || "",
          recommendation_price: (record as any).recommendation_price ?? "",
          exit_price: (record as any).exit_price ?? "",
          exit_date: (record as any).exit_date || "",
          holding_period: (record as any).holding_period ?? "",
          total_return: (record as any).total_return ?? "",
          is_active: true,
        }];
      }
      setStockPerformance(perf);
      setActivePerformanceIndex(perf && perf.length > 0 ? 0 : 0);

      setIsActive(perf[0]?.is_active ?? false);

      setAnnouncements(Array.isArray(record.announcements_and_update) ? [...record.announcements_and_update] : []);
      setLocalError({});
    } else if (!open) {
      reset();
      setStockPerformance([]);
      setActivePerformanceIndex(0);
      setAnnouncements([]);
      setLocalError({});
      setIsActive(false);
    }
  }, [open, record, reset]);

  useEffect(() => {
    setIsActive(stockPerformance[activePerformanceIndex]?.is_active ?? false);
  }, [activePerformanceIndex, stockPerformance]);

  const handleFileSelect = (fieldName: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    setValue(fieldName as any, file.name as any, { shouldValidate: true, shouldDirty: true });
    setLocalError((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleClearFile = (fieldName: string) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }));
    setValue(fieldName as any, "", { shouldValidate: true, shouldDirty: true });
    setLocalError((prev) => ({ ...prev, [fieldName]: "" }));

    if (fieldName === "logo" && logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // PDF upload for business_note, quick_bite, and exit_rationale
  const handlePerformanceFileUpload = async (
    perfIndex: number,
    field: "business_note" | "exit_rationale" | "quick_bite",
    file: File
  ) => {
    const perf = stockPerformance[perfIndex];
    if (!perf) return;
    try {
      setUploading((prev) => ({ ...prev, [`stockperf_${perfIndex}_${field}`]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${field}_${perfIndex}`);
      formData.append("category", "pdf");
      const symbol = record?.nseSymbol || "unknown";
      formData.append("dir", `recommendations/${symbol}/performance/${perfIndex}`);
      const response = await uploadFile(formData);
      setStockPerformance((prev) => {
        const next = [...prev];
        next[perfIndex] = { ...next[perfIndex], [field]: response.data.url };
        return next;
      });
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setUploading((prev) => ({ ...prev, [`stockperf_${perfIndex}_${field}`]: false }));
    }
  };

  // Clear PDFs for performance fields (now handle quick_bite too, and allow setting null)
  const handleClearPerformanceFile = (
    perfIndex: number,
    field: "business_note" | "exit_rationale" | "quick_bite"
  ) => {
    setStockPerformance((prev) => {
      const next = [...prev];
      next[perfIndex] = { ...next[perfIndex], [field]: null };
      return next;
    });
    if (field === "business_note" && businessNoteInputRef.current) {
      businessNoteInputRef.current.value = "";
    }
    if (field === "exit_rationale" && exitRationaleInputRef.current) {
      exitRationaleInputRef.current.value = "";
    }
    if (field === "quick_bite" && quickBiteInputRef.current) {
      quickBiteInputRef.current.value = "";
    }
  };

  const handleAddQuarterlyUpdate = () => {
    setStockPerformance((prev) => {
      const next = [...prev];
      next[activePerformanceIndex].quarterly_update = [
        ...(next[activePerformanceIndex].quarterly_update || []),
        { date: "", title: "", description: "", pdf_url: "" },
      ];
      return next;
    });
    setEditingQuarterly(
      (stockPerformance[activePerformanceIndex]?.quarterly_update?.length ?? 0)
    );
  };

  const handleRemoveQuarterlyUpdate = (idx: number) => {
    setStockPerformance((prev) => {
      const next = [...prev];
      next[activePerformanceIndex].quarterly_update = next[activePerformanceIndex]
        .quarterly_update?.filter((_, i) => i !== idx) || [];
      return next;
    });
    setEditingQuarterly(null);
  };

  const handleUpdateQuarterlyUpdate = (idx: number, field: keyof UpdateItem, value: string) => {
    setStockPerformance((prev) => {
      const next = [...prev];
      const updates = [...(next[activePerformanceIndex].quarterly_update || [])];
      updates[idx] = { ...updates[idx], [field]: value };
      next[activePerformanceIndex].quarterly_update = updates;
      return next;
    });
  };

  const handleQuarterlyPdfUpload = async (idx: number, file: File) => {
    try {
      setQuarterlyUploading((prev) => ({ ...prev, [idx]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `quarterly_update_pdf_url_${idx}`);
      formData.append("category", "pdf");
      const symbol = record?.nseSymbol || "unknown";
      formData.append(
        "dir",
        `recommendations/${symbol}/performance/${activePerformanceIndex}/quarterly_updates`
      );
      const response = await uploadFile(formData);
      setStockPerformance((prev) => {
        const next = [...prev];
        const updates = [...(next[activePerformanceIndex].quarterly_update || [])];
        updates[idx] = { ...updates[idx], pdf_url: response.data.url };
        next[activePerformanceIndex].quarterly_update = updates;
        return next;
      });
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setQuarterlyUploading((prev) => ({ ...prev, [idx]: false }));
      if (quarterlyPdfInputRefs.current[idx]) quarterlyPdfInputRefs.current[idx]!.value = "";
    }
  };

  const handleClearQuarterlyPdf = (idx: number) => {
    setStockPerformance((prev) => {
      const next = [...prev];
      const updates = [...(next[activePerformanceIndex].quarterly_update || [])];
      updates[idx] = { ...updates[idx], pdf_url: "" };
      next[activePerformanceIndex].quarterly_update = updates;
      return next;
    });
    if (quarterlyPdfInputRefs.current[idx]) quarterlyPdfInputRefs.current[idx]!.value = "";
  };

  // Announcements & Updates logic unchanged...

  const handleAddAnnouncement = () => {
    setAnnouncements((prev) => [
      ...prev,
      { date: "", title: "", description: "", pdf_url: "" },
    ]);
    setEditingAnnouncement(announcements.length);
  };

  const handleRemoveAnnouncement = (idx: number) => {
    setAnnouncements((prev) => prev.filter((_, i) => i !== idx));
    setEditingAnnouncement(null);
  };

  const handleUpdateAnnouncement = (idx: number, field: keyof UpdateItem, value: string) => {
    setAnnouncements((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleAnnouncementPdfUpload = async (idx: number, file: File) => {
    try {
      setAnnouncementUploading((prev) => ({ ...prev, [idx]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", "announcement_pdf_url_" + idx);
      formData.append("category", "pdf");
      const symbol = record?.nseSymbol || "unknown";
      formData.append("dir", `recommendations/${symbol}/announcements_and_update`);
      const response = await uploadFile(formData);
      setAnnouncements((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], pdf_url: response.data.url };
        return next;
      });
      toast.success("PDF uploaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setAnnouncementUploading((prev) => ({ ...prev, [idx]: false }));
      if (announcementPdfInputRefs.current[idx]) announcementPdfInputRefs.current[idx]!.value = "";
    }
  };

  const handleClearAnnouncementPdf = (idx: number) => {
    setAnnouncements((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], pdf_url: "" };
      return next;
    });
    if (announcementPdfInputRefs.current[idx]) announcementPdfInputRefs.current[idx]!.value = "";
  };

  // Stock Performance CRUD...

  const handleAddPerformance = () => {
    setStockPerformance((prev) => [
      {
        date: "",
        title: "",
        stock_recommendation_url: "",
        business_note: null,
        quick_bite: null,
        video: "",
        exit_rationale: null,
        quarterly_update: [],
        recommendation_date: "",
        recommendation_price: "",
        exit_price: "",
        exit_date: "",
        holding_period: "",
        total_return: "",
        is_active: false,
      },
      ...prev,
    ]);
    setActivePerformanceIndex(0);
    setIsActive(false);
  };

  const handleRemovePerformance = (idx: number) => {
    setStockPerformance((prev) => {
      let arr = [...prev];
      if (arr.length === 0) return arr;
      arr.splice(idx, 1);
      return arr;
    });
    setActivePerformanceIndex((prev) =>
      prev === idx ? 0 : prev > idx ? prev - 1 : prev
    );
    setTimeout(() => {
      setIsActive(
        (sp) => sp[activePerformanceIndex]?.is_active ?? false
      );
    }, 0);
  };

  const validateFileFields = () => {
    const errors: Record<string, string> = {};
    if ((!selectedFiles.logo && !watch("logo")) || (typeof watch("logo") === "string" && watch("logo").trim() === "")) {
      errors.logo = "Company Logo is required";
    }
    if (
      stockPerformance.length === 0 ||
      stockPerformance.some(
        (item) =>
          !item.date.trim() ||
          !item.title.trim() ||
          !item.stock_recommendation_url.trim()
      )
    ) {
      errors.stock_performance_url =
        "At least one complete performance (Date, Title, URL) is required.";
    }
    if (!watch("tags") || watch("tags").trim() === "") {
      errors.tags = "Tags is required";
    }
    setLocalError(errors);
    return Object.keys(errors).length === 0;
  };

  // --------- HANDLER FOR CLEARING QUICK BITE FIELD ---------
  const handleClearQuickBite = () => {
    setStockPerformance((prev) => {
      const next = [...prev];
      next[activePerformanceIndex] = {
        ...next[activePerformanceIndex],
        quick_bite: null,
      };
      return next;
    });
    if (quickBiteInputRef.current) {
      quickBiteInputRef.current.value = "";
    }
  };

  // --------- FORM SUBMIT ---------
  const onSubmit = async (data: RecommendationFormValues) => {
    const valid = await trigger();
    const validatedFiles = validateFileFields();
    if (!valid || !validatedFiles) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      let newSP = [...stockPerformance];
      newSP = newSP.map((perf, idx) => ({
        ...perf,
        is_active: idx === activePerformanceIndex ? isActive : false,
        // Ensure these three fields are allowed to be null
        business_note: perf.business_note === "" ? null : perf.business_note,
        quick_bite: perf.quick_bite === "" ? null : perf.quick_bite,
        exit_rationale: perf.exit_rationale === "" ? null : perf.exit_rationale,
      }));

      if (isActive) {
        newSP[activePerformanceIndex] = {
          ...newSP[activePerformanceIndex],
          exit_price: "",
          exit_date: "",
        };
      }

      const formData = new FormData();
      formData.append("company_symbol", record.nseSymbol || "");
      formData.append("tags", data.tags || "");

      let finalPerformance = [...newSP].reverse();
      formData.append("stock_performance_url", JSON.stringify(finalPerformance));

      if (selectedFiles.logo) {
        formData.append("logo", selectedFiles.logo);
      }

      formData.append("announcements_and_update", JSON.stringify(announcements));
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

  const formatDateForInput = (value?: string) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    return !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : "";
  };

  const [performanceSelectOpen, setPerformanceSelectOpen] = useState(false);

  useEffect(() => {
    if (open && stockPerformance && stockPerformance.length > 0) {
      setTimeout(() => setPerformanceSelectOpen(true), 150);
    } else {
      setPerformanceSelectOpen(false);
    }
  }, [open, stockPerformance.length]);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-4xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto z-[99999]">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Recommendation - {record.nseSymbol}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Update company information, logo, performance & resources.
          </Dialog.Description>
          <form className="mt-4 space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="bg-gray-50 p-4 rounded-md mb-2">
              <h3 className="font-medium mb-2">Company Information</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Symbol</label>
                  <p className="font-medium">{record.nseSymbol}</p>
                </div>
                <div>
                  <label className="text-gray-600">Action</label>
                  <p className="font-medium">{record.action}</p>
                </div>
                <div>
                  <label className="text-gray-600">% Return</label>
                  <p className="font-medium">
                    {Math.round(Number(record?.percentReturn) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-md mb-2">
              <label className="block text-sm font-medium mb-2">Company Logo (Image) <span className="text-red-600">*</span></label>
              <div className="flex gap-2 items-center">
                <Input
                  {...register("logo")}
                  placeholder="Logo file or name"
                  className={localError.logo || errors.logo ? "border-red-500" : ""}
                  autoComplete="off"
                  readOnly={!!selectedFiles.logo}
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
                {(selectedFiles.logo || (watch("logo") && typeof watch("logo") === "string")) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleClearFile("logo")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
              {watch("logo") && !selectedFiles.logo && typeof watch("logo") === "string"
                && watch("logo").startsWith("http") && (
                <div className="mt-2">
                  <img
                    src={watch("logo")}
                    alt="Company logo"
                    className="h-12 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags <span className="text-red-600">*</span>
              </label>
              <Select onValueChange={handleTagsChange} value={watch("tags")}>
                <SelectTrigger className={`w-[180px] ${localError.tags || errors.tags ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={4} style={{ zIndex: 1000001 }}>
                  <SelectGroup>
                    <SelectLabel>Select a Tag</SelectLabel>
                    {TAG_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {(localError.tags || errors.tags) && (
                <div className="text-xs text-red-600 mt-1">{localError.tags || errors.tags?.message}</div>
              )}
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-md space-y-2 mb-2">
              <h3 className="font-medium text-base">Stock Performance</h3>
              <p className="text-xs text-gray-500 mb-2">Each entry is a performance spreadsheet (date, title, and URL). Manage, add or remove below. The checkbox in each row marks the entry as currently active.</p>
              <div className="space-y-2">
                <Button type="button" size="sm" variant="outline" onClick={handleAddPerformance}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Performance
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-center">Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockPerformance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No stock performance records yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {stockPerformance.map((perf, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            type="date"
                            value={perf.date}
                            onChange={(e) =>
                              setStockPerformance((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], date: e.target.value };
                                return next;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Performance title"
                            value={perf.title}
                            onChange={(e) =>
                              setStockPerformance((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], title: e.target.value };
                                return next;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Google Sheets / Document URL"
                            value={perf.stock_recommendation_url}
                            onChange={(e) => {
                              setStockPerformance((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], stock_recommendation_url: e.target.value };
                                return next;
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={!!perf.is_active}
                            onChange={e => {
                              const checked = e.target.checked;
                              setStockPerformance(prev => {
                                const next = prev.map((p, i) =>
                                  i === idx
                                    ? {
                                        ...p,
                                        is_active: checked,
                                        exit_price: checked ? "" : p.exit_price,
                                        exit_date: checked ? "" : p.exit_date,
                                        holding_period: checked ? "" : p.holding_period,
                                        total_return: checked ? "" : p.total_return,
                                      }
                                    : { ...p, is_active: false }
                                );
                                return next;
                              });
                              setIsActive(checked);
                              setActivePerformanceIndex(idx);
                            }}
                            aria-label="Mark as active performance"
                            className="accent-blue-600"
                          />
                          {perf.is_active ? (
                            <span className="sr-only">Active</span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => handleRemovePerformance(idx)}
                            disabled={stockPerformance.length === 1}
                            title={stockPerformance.length === 1 ? "Cannot remove last performance entry" : ""}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(localError.stock_performance_url || errors.stock_performance_url) && (
                  <div className="text-xs text-red-600 mt-1">
                    {/* @ts-ignore */}
                    {localError.stock_performance_url || errors.stock_performance_url?.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center mt-4 gap-2 flex-wrap">
              <label className="text-sm font-medium mr-4">Select Performance Entry:</label>
              <div className="flex flex-wrap gap-3">
                {stockPerformance.map((perf, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="performanceEntry"
                      value={idx}
                      checked={activePerformanceIndex === idx}
                      onChange={() => setActivePerformanceIndex(idx)}
                      disabled={stockPerformance.length === 0}
                      className="accent-blue-600"
                    />
                    <span>
                      {perf.title
                        ? perf.title + (perf.date ? ` (${perf.date})` : "")
                        : `Entry ${idx + 1}`}
                      {perf.is_active && (
                        <span className="ml-1 text-xs text-green-600 font-medium">(Active)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ---- Additional Recommendation Fields ---- */}
            <div className="bg-white border border-gray-200 p-4 rounded-md space-y-4 mb-2">
              <h3 className="font-medium mb-2">Recommendation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Recommendation Date</label>
                  <Input
                    type="date"
                    value={stockPerformance[activePerformanceIndex]?.recommendation_date || ""}
                    onChange={e => {
                      setStockPerformance(prev => {
                        const next = [...prev];
                        next[activePerformanceIndex] = {
                          ...next[activePerformanceIndex],
                          recommendation_date: e.target.value,
                        };
                        return next;
                      });
                    }}
                    placeholder="Recommendation Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recommendation Price</label>
                  <Input
                    type="number"
                    value={stockPerformance[activePerformanceIndex]?.recommendation_price || ""}
                    onChange={e => {
                      setStockPerformance(prev => {
                        const next = [...prev];
                        next[activePerformanceIndex] = {
                          ...next[activePerformanceIndex],
                          recommendation_price: e.target.value,
                        };
                        return next;
                      });
                    }}
                    placeholder="Recommendation Price"
                  />
                </div>
                {!stockPerformance[activePerformanceIndex]?.is_active && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Exit Price</label>
                      <Input
                        type="number"
                        value={stockPerformance[activePerformanceIndex]?.exit_price || ""}
                        onChange={e => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              exit_price: e.target.value,
                            };
                            return next;
                          });
                        }}
                        placeholder="Exit Price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Exit Date</label>
                      <Input
                        type="date"
                        value={stockPerformance[activePerformanceIndex]?.exit_date || ""}
                        onChange={e => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              exit_date: e.target.value,
                            };
                            return next;
                          });
                        }}
                        placeholder="Exit Date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Holding Period</label>
                      <Input
                        type="text"
                        value={stockPerformance[activePerformanceIndex]?.holding_period || ""}
                        onChange={e => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              holding_period: e.target.value,
                            };
                            return next;
                          });
                        }}
                        placeholder="Holding Period"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Return</label>
                      <Input
                        type="text"
                        value={stockPerformance[activePerformanceIndex]?.total_return || ""}
                        onChange={e => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              total_return: e.target.value,
                            };
                            return next;
                          });
                        }}
                        placeholder="Total Return"
                      />
                    </div>
                  </>
                )}
                {stockPerformance[activePerformanceIndex]?.is_active && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-400">
                        Exit Price <span className="text-xs">(disabled for active)</span>
                      </label>
                      <Input
                        type="number"
                        value=""
                        disabled
                        placeholder="Not applicable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-400">
                        Exit Date <span className="text-xs">(disabled for active)</span>
                      </label>
                      <Input
                        type="date"
                        value=""
                        disabled
                        placeholder="Not applicable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-400">
                        Holding Period <span className="text-xs">(disabled for active)</span>
                      </label>
                      <Input
                        type="text"
                        value=""
                        disabled
                        placeholder="Not applicable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-400">
                        Total Return <span className="text-xs">(disabled for active)</span>
                      </label>
                      <Input
                        type="text"
                        value=""
                        disabled
                        placeholder="Not applicable"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* -- Selected Stock Performance Card with editable quick bite/business note/exit rationale -- */}
            {stockPerformance.length > 0 && (
            <div className="border rounded-lg bg-white p-4 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base">
                  Resources & Updates for <span className="font-bold">{stockPerformance[activePerformanceIndex]?.title || "Performance"}</span>
                </h3>
                <span className="text-sm text-blue-600">
                  ({stockPerformance[activePerformanceIndex]?.date || "–"})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Business Note --- */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Note (PDF)
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={stockPerformance[activePerformanceIndex]?.business_note || ""}
                      onChange={e => {
                        const value = e.target.value === "" ? null : e.target.value;
                        setStockPerformance(prev => {
                          const next = [...prev];
                          next[activePerformanceIndex] = {
                            ...next[activePerformanceIndex],
                            business_note: value,
                          };
                          return next;
                        });
                      }}
                      placeholder="PDF URL"
                      key={stockPerformance[activePerformanceIndex]?.business_note || "empty"} // <--- force re-render on clear
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!!uploading[`stockperf_${activePerformanceIndex}_business_note`]}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading[`stockperf_${activePerformanceIndex}_business_note`] ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={businessNoteInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePerformanceFileUpload(activePerformanceIndex, "business_note", file);
                            // Reset file input so user can reselect the same file after clearing
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {(stockPerformance[activePerformanceIndex]?.business_note) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => {
                          handleClearPerformanceFile(activePerformanceIndex, "business_note");
                          // If input ref is available, reset the file input too
                          if (businessNoteInputRef.current) {
                            businessNoteInputRef.current.value = "";
                          }
                        }}
                        title="Clear PDF"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* NEW: allow clearing even if empty/non-null */}
                    {(!stockPerformance[activePerformanceIndex]?.business_note) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              business_note: null,
                            };
                            return next;
                          });
                          if (businessNoteInputRef.current) businessNoteInputRef.current.value = "";
                        }}
                        title="Clear"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {stockPerformance[activePerformanceIndex]?.business_note && (
                    <div className="mt-1 text-xs">
                      <a
                        href={stockPerformance[activePerformanceIndex]?.business_note}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
                {/* --- Quick Bite --- */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quick Bite (PDF)
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={stockPerformance[activePerformanceIndex]?.quick_bite || ""}
                      onChange={e => {
                        const value = e.target.value === "" ? null : e.target.value;
                        setStockPerformance((prev) => {
                          const next = [...prev];
                          next[activePerformanceIndex] = { ...next[activePerformanceIndex], quick_bite: value };
                          return next;
                        });
                      }}
                      placeholder="PDF URL"
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!!uploading[`stockperf_${activePerformanceIndex}_quick_bite`]}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading[`stockperf_${activePerformanceIndex}_quick_bite`] ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={quickBiteInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePerformanceFileUpload(activePerformanceIndex, "quick_bite", file);
                          }
                        }}
                      />
                    </label>
                    {(stockPerformance[activePerformanceIndex]?.quick_bite) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() =>
                          handleClearPerformanceFile(activePerformanceIndex, "quick_bite")
                        }
                        title="Clear PDF"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Always allow clearing */}
                    {(!stockPerformance[activePerformanceIndex]?.quick_bite) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              quick_bite: null,
                            };
                            return next;
                          });
                          if (quickBiteInputRef.current) quickBiteInputRef.current.value = "";
                        }}
                        title="Clear"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {stockPerformance[activePerformanceIndex]?.quick_bite && (
                    <div className="mt-1 text-xs">
                      <a
                        href={stockPerformance[activePerformanceIndex]?.quick_bite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
                {/* --- Exit Rationale --- */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exit Rationale (PDF)
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={stockPerformance[activePerformanceIndex]?.exit_rationale || ""}
                      onChange={e => {
                        const value = e.target.value === "" ? null : e.target.value;
                        setStockPerformance(prev => {
                          const next = [...prev];
                          next[activePerformanceIndex] = {
                            ...next[activePerformanceIndex],
                            exit_rationale: value,
                          };
                          return next;
                        });
                      }}
                      placeholder="PDF URL"
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!!uploading[`stockperf_${activePerformanceIndex}_exit_rationale`]}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          {uploading[`stockperf_${activePerformanceIndex}_exit_rationale`] ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                      <input
                        ref={exitRationaleInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePerformanceFileUpload(activePerformanceIndex, "exit_rationale", file);
                          }
                        }}
                      />
                    </label>
                    {(stockPerformance[activePerformanceIndex]?.exit_rationale) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() =>
                          handleClearPerformanceFile(activePerformanceIndex, "exit_rationale")
                        }
                        title="Clear PDF"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {(!stockPerformance[activePerformanceIndex]?.exit_rationale) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => {
                          setStockPerformance(prev => {
                            const next = [...prev];
                            next[activePerformanceIndex] = {
                              ...next[activePerformanceIndex],
                              exit_rationale: null,
                            };
                            return next;
                          });
                          if (exitRationaleInputRef.current) exitRationaleInputRef.current.value = "";
                        }}
                        title="Clear"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {stockPerformance[activePerformanceIndex]?.exit_rationale && (
                    <div className="mt-1 text-xs">
                      <a
                        href={stockPerformance[activePerformanceIndex]?.exit_rationale}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
                {/* Video URL section unchanged */}
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL</label>
                  <Input
                    value={stockPerformance[activePerformanceIndex]?.video || ""}
                    onChange={e => {
                      setStockPerformance((prev) => {
                        const next = [...prev];
                        next[activePerformanceIndex] = { ...next[activePerformanceIndex], video: e.target.value };
                        return next;
                      });
                    }}
                    placeholder="YouTube or Vimeo URL"
                  />
                </div>
              </div>
              {/* --- Quarterly Updates Section --- */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium text-base">Quarterly Updates</h4>
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
                  {!(stockPerformance[activePerformanceIndex]?.quarterly_update || []).length ? (
                    <div className="text-center py-6 text-gray-500">
                      No quarterly updates. Click "Add Update" to create one.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[110px]">Date</TableHead>
                          <TableHead className="w-[160px]">Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[220px]">PDF</TableHead>
                          <TableHead className="w-[100px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(stockPerformance[activePerformanceIndex]?.quarterly_update || []).map((q, idx) => (
                          <TableRow key={idx}>
                            {editingQuarterly === idx ? (
                              <>
                                <TableCell>
                                  <Input
                                    type="date"
                                    value={formatDateForInput(q.date)}
                                    onChange={(e) => handleUpdateQuarterlyUpdate(idx, "date", e.target.value)}
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={q.title}
                                    onChange={(e) => handleUpdateQuarterlyUpdate(idx, "title", e.target.value)}
                                    placeholder="Title"
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    value={q.description}
                                    onChange={(e) => handleUpdateQuarterlyUpdate(idx, "description", e.target.value)}
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
                                        disabled={quarterlyUploading[idx]}
                                        asChild
                                      >
                                        <span>
                                          <Upload className="h-4 w-4 mr-1" />
                                          {quarterlyUploading[idx] ? "Uploading..." : "Upload"}
                                        </span>
                                      </Button>
                                      <input
                                        ref={(el) => { quarterlyPdfInputRefs.current[idx] = el; }}
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleQuarterlyPdfUpload(idx, file);
                                        }}
                                      />
                                    </label>
                                    {q.pdf_url && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() => handleClearQuarterlyPdf(idx)}
                                        title="Clear PDF"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  {q.pdf_url && q.pdf_url.startsWith("http") && (
                                    <div className="mt-1 text-xs">
                                      <a
                                        href={q.pdf_url}
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
                                <TableCell className="text-sm">{formatDateForInput(q.date) || "-"}</TableCell>
                                <TableCell className="text-sm font-medium">{q.title || "-"}</TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  <div className="max-w-xs truncate" title={q.description}>{q.description || "-"}</div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {q.pdf_url ? (
                                    <a
                                      href={q.pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline truncate block max-w-[120px]"
                                    >
                                      View PDF
                                    </a>
                                  ) : "-"}
                                </TableCell>
                                <TableCell className="text-center space-x-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingQuarterly(idx)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleRemoveQuarterlyUpdate(idx)}
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
            )}

            <div className="border rounded-lg bg-white p-4 space-y-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-base">Announcements & Updates</h3>
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
                  <div className="text-center py-6 text-gray-500">
                    No announcements. Click "Add Announcement" to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[110px]">Date</TableHead>
                        <TableHead className="w-[160px]">Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[220px]">PDF</TableHead>
                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((ann, idx) => (
                        <TableRow key={idx}>
                          {editingAnnouncement === idx ? (
                            <>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={formatDateForInput(ann.date)}
                                  onChange={(e) => handleUpdateAnnouncement(idx, "date", e.target.value)}
                                  className="text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={ann.title}
                                  onChange={(e) => handleUpdateAnnouncement(idx, "title", e.target.value)}
                                  placeholder="Title"
                                  className="text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  value={ann.description}
                                  onChange={(e) => handleUpdateAnnouncement(idx, "description", e.target.value)}
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
                                      disabled={!!announcementUploading[idx]}
                                      asChild
                                    >
                                      <span>
                                        <Upload className="h-4 w-4 mr-1" />
                                        {announcementUploading[idx] ? "Uploading..." : "Upload"}
                                      </span>
                                    </Button>
                                    <input
                                      ref={(el) => announcementPdfInputRefs.current[idx] = el}
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAnnouncementPdfUpload(idx, file);
                                      }}
                                    />
                                  </label>
                                  {ann.pdf_url && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500"
                                      onClick={() => handleClearAnnouncementPdf(idx)}
                                      title="Clear PDF"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                {ann.pdf_url && ann.pdf_url.startsWith("http") && (
                                  <div className="mt-1 text-xs">
                                    <a
                                      href={ann.pdf_url}
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
                              <TableCell className="text-sm">{formatDateForInput(ann.date) || "-"}</TableCell>
                              <TableCell className="text-sm font-medium">{ann.title || "-"}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                <div className="max-w-xs truncate" title={ann.description}>{ann.description || "-"}</div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {ann.pdf_url ? (
                                  <a
                                    href={ann.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate block max-w-[120px]"
                                  >
                                    View PDF
                                  </a>
                                ) : "-"}
                              </TableCell>
                              <TableCell className="text-center space-x-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingAnnouncement(idx)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRemoveAnnouncement(idx)}
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

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
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
