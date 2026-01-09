import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../../../api/axios";
import { uploadFile } from "@/api/files-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const recommendationSchema = z.object({
  nseSymbol: z.string().min(1, "Symbol is required"),
  logo: z.string().min(1, "Company Logo is required"),
  business_note: z.string().min(1, "Business Note (PDF) is required"),
  // Stock performance URLs are managed via local state as an array of
  // { date, title, stock_recommendation_url } objects.
  // Keep this optional so zod doesn't block submit; we validate manually.
  stock_performance_url: z.any().optional(),
  tags: z.string().min(1, "Tags is required"),
  video: z.string().optional(),
  quick_bite: z.string().optional(),
  exit_rationale: z.string().optional(),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

interface UpdateItem {
  date: string;
  title: string;
  description: string;
  pdf_url: string;
}

interface StockPerformanceItem {
  date: string;
  title: string;
  stock_recommendation_url: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
}

interface AddRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  sheetStocks: { id: string; code: string }[];
}

const AddRecommendationModal: React.FC<AddRecommendationModalProps> = ({
  open,
  onClose,
  onSave,
  sheetStocks,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [quarterlyUpdates, setQuarterlyUpdates] = useState<UpdateItem[]>([]);
  const [announcements, setAnnouncements] = useState<UpdateItem[]>([]);
  const [stockPerformanceItems, setStockPerformanceItems] = useState<StockPerformanceItem[]>([]);
  const [quarterlyUploading, setQuarterlyUploading] = useState<Record<number, boolean>>({});
  const [announcementUploading, setAnnouncementUploading] = useState<Record<number, boolean>>({});
  const [selectedIterationIndex, setSelectedIterationIndex] = useState<number>(0);
  const [iterationResourceUploading, setIterationResourceUploading] = useState<
    Record<string, boolean>
  >({});
  const [iterationQuarterlyUploading, setIterationQuarterlyUploading] =
    useState<Record<string, boolean>>({});

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const businessNoteInputRef = useRef<HTMLInputElement | null>(null);
  const quickBiteInputRef = useRef<HTMLInputElement | null>(null);
  const exitRationaleInputRef = useRef<HTMLInputElement | null>(null);
  const iterationBusinessNoteInputRef = useRef<HTMLInputElement | null>(null);
  const iterationQuickBiteInputRef = useRef<HTMLInputElement | null>(null);
  const iterationExitRationaleInputRef = useRef<HTMLInputElement | null>(null);

  const quarterlyPdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const announcementPdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const iterationQuarterlyPdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset refs array on every render
  quarterlyPdfInputRefs.current = [];
  announcementPdfInputRefs.current = [];
  iterationQuarterlyPdfInputRefs.current = [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    reset,
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      nseSymbol: "",
      logo: "",
      business_note: "",
      tags: "",
      video: "",
    },
  });

  const [localError, setLocalError] = useState<Record<string, string>>({});

  // Reset form and state when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setSelectedFiles({});
      setQuarterlyUpdates([]);
      setAnnouncements([]);
      setStockPerformanceItems([]);
      setLocalError({});
      setSelectedIterationIndex(0);
      setIterationResourceUploading({});
      setIterationQuarterlyUploading({});
    }
  }, [open, reset]);

  useEffect(() => {
    setSelectedIterationIndex((prev) => {
      if (stockPerformanceItems.length === 0) return 0;
      return Math.min(prev, stockPerformanceItems.length - 1);
    });
  }, [stockPerformanceItems.length]);

  const handleFileSelect = (fieldName: string, file: File) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    setValue(fieldName as any, file.name, { shouldValidate: true });
    setLocalError((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleIterationResourceUpload = async (
    field: "business_note" | "quick_bite" | "exit_rationale",
    file: File
  ) => {
    const symbol = watch("nseSymbol") || "temp";
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
      formData.append("dir", `recommendations/${symbol}/iterations/${iterationIndex}`);

      const response = await uploadFile(formData);
      setStockPerformanceItems((prev) => {
        const next = [...prev];
        if (!next[iterationIndex]) return prev;
        next[iterationIndex] = { ...next[iterationIndex], [field]: response.data.url };
        return next;
      });
      toast.success("PDF uploaded");
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

  const getIterationQuarterlyUpdates = (iterationIndex: number) =>
    Array.isArray(stockPerformanceItems?.[iterationIndex]?.quarterly_update)
      ? (stockPerformanceItems[iterationIndex].quarterly_update as UpdateItem[])
      : [];

  const setIterationQuarterlyUpdates = (iterationIndex: number, nextUpdates: UpdateItem[]) => {
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
    const symbol = watch("nseSymbol") || "temp";
    const uploadKey = `${iterationIndex}:${index}`;
    try {
      setIterationQuarterlyUploading((prev) => ({ ...prev, [uploadKey]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `quarterly_update_pdf_${iterationIndex}_${index}`);
      formData.append("category", "pdf");
      formData.append(
        "dir",
        `recommendations/${symbol}/iterations/${iterationIndex}/quarterly_updates`
      );
      const response = await uploadFile(formData);
      const updates = getIterationQuarterlyUpdates(iterationIndex);
      const nextUpdates = [...updates];
      nextUpdates[index] = { ...nextUpdates[index], pdf_url: response.data.url };
      setIterationQuarterlyUpdates(iterationIndex, nextUpdates);
      toast.success("Quarterly update PDF uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setIterationQuarterlyUploading((prev) => ({ ...prev, [uploadKey]: false }));
      if (iterationQuarterlyPdfInputRefs.current[index]) {
        iterationQuarterlyPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleQuarterlyPdfUpload = async (index: number, file: File) => {
    const symbol = watch("nseSymbol") || "temp";
    try {
      setQuarterlyUploading((prev) => ({ ...prev, [index]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `quarterly_update_pdf_${index}`);
      formData.append("category", "pdf");
      formData.append("dir", `recommendations/${symbol}/quarterly_updates`);

      const response = await uploadFile(formData);

      setQuarterlyUpdates((prev) => {
        const updated = [...prev];
        updated[index].pdf_url = response.data.url;
        return updated;
      });
      toast.success("Quarterly update PDF uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setQuarterlyUploading((prev) => ({ ...prev, [index]: false }));
      if (quarterlyPdfInputRefs.current[index]) {
        quarterlyPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleAnnouncementPdfUpload = async (index: number, file: File) => {
    const symbol = watch("nseSymbol") || "temp";
    try {
      setAnnouncementUploading((prev) => ({ ...prev, [index]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `announcement_pdf_${index}`);
      formData.append("category", "pdf");
      formData.append("dir", `recommendations/${symbol}/announcements_and_update`);
      const response = await uploadFile(formData);

      setAnnouncements((prev) => {
        const updated = [...prev];
        updated[index].pdf_url = response.data.url;
        return updated;
      });
      toast.success("Announcement PDF uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload PDF");
    } finally {
      setAnnouncementUploading((prev) => ({ ...prev, [index]: false }));
      if (announcementPdfInputRefs.current[index]) {
        announcementPdfInputRefs.current[index]!.value = "";
      }
    }
  };

  const validateRequiredFiles = () => {
    const err: Record<string, string> = {};
    if (!selectedFiles.logo) err.logo = "Company Logo is required";
    if (!selectedFiles.business_note) err.business_note = "Business Note (PDF) is required";
    if (
      !stockPerformanceItems.length ||
      stockPerformanceItems.some(
        (item) =>
          !item.date.trim() ||
          !item.title.trim() ||
          !item.stock_recommendation_url.trim()
      )
    ) {
      err.stock_performance_url = "At least one complete performance URL (date, title, URL) is required";
    }
    if (!watch("tags")?.trim()) err.tags = "Tags is required";
    setLocalError(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (data: RecommendationFormValues) => {
    const valid = await trigger();
    if (!valid || !validateRequiredFiles()) {
      toast.error("Please fill all required fields");
      return;
    }

    const stockPerformancePayload = stockPerformanceItems.map((item, index) =>
      index === 0
        ? {
            ...item,
            quarterly_update: quarterlyUpdates,
            announcements_and_update: announcements,
          }
        : item
    );

    const formData = new FormData();
    formData.append("company_symbol", data.nseSymbol);
    formData.append("video", data.video || "");
    formData.append("stock_performance_url", JSON.stringify(stockPerformancePayload));
    formData.append("quarterly_update", JSON.stringify(quarterlyUpdates));
    formData.append("announcements_and_update", JSON.stringify(announcements));
    formData.append("tags", data.tags);

    if (selectedFiles.logo) formData.append("logo", selectedFiles.logo);
    if (selectedFiles.business_note) formData.append("business_note", selectedFiles.business_note);
    if (selectedFiles.quick_bite) formData.append("quick_bite", selectedFiles.quick_bite);
    if (selectedFiles.exit_rationale) formData.append("exit_rationale", selectedFiles.exit_rationale);

    try {
      await onSave(formData);
      toast.success("Recommendation created successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create recommendation");
    }
  };

  const TAG_OPTIONS = [
    { label: "Core (Quarterly)", value: "core" },
    { label: "Core Annual", value: "core_annual" },
    { label: "Research Ally", value: "research_hub" },
    { label: "Freemium", value: "freemium" },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-7xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl overflow-y-auto z-50">
          <Dialog.Title className="text-2xl font-semibold text-gray-900">
            Add New Recommendation
          </Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8" noValidate>
            {/* Symbol & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  NSE Symbol <span className="text-red-600">*</span>
                </label>
                <Select
                  value={watch("nseSymbol")}
                  onValueChange={(v) => setValue("nseSymbol", v, { shouldValidate: true })}
                >
                  <SelectTrigger className={errors.nseSymbol ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select stock from sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetStocks.map((stock, id) => (
                      <SelectItem key={id} value={stock.code}>
                        {stock.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nseSymbol && (
                  <p className="text-xs text-red-600 mt-1">{errors.nseSymbol.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags <span className="text-red-600">*</span>
                </label>
                <Select
                  value={watch("tags")}
                  onValueChange={(v) => setValue("tags", v, { shouldValidate: true })}
                >
                  <SelectTrigger className={localError.tags ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_OPTIONS.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        {tag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {localError.tags && <p className="text-xs text-red-600 mt-1">{localError.tags}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Video URL</label>
                <Input {...register("video")} placeholder="https://youtube.com/..." />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Documents & Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Logo <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={selectedFiles.logo?.name || ""}
                      readOnly
                      placeholder="No file selected"
                      className={localError.logo ? "border-red-500" : ""}
                    />
                    <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("logo", e.target.files[0])}
                    />
                  </div>
                  {localError.logo && <p className="text-xs text-red-600 mt-1">{localError.logo}</p>}
                </div>

                {/* Business Note */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Note (PDF) <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={selectedFiles.business_note?.name || ""}
                      readOnly
                      placeholder="No file selected"
                      className={localError.business_note ? "border-red-500" : ""}
                    />
                    <Button type="button" variant="outline" onClick={() => businessNoteInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                    <input
                      ref={businessNoteInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("business_note", e.target.files[0])}
                    />
                  </div>
                  {localError.business_note && <p className="text-xs text-red-600 mt-1">{localError.business_note}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quick Bite (PDF)</label>
                  <div className="flex gap-3">
                    <Input value={selectedFiles.quick_bite?.name || ""} readOnly placeholder="Optional" />
                    <Button type="button" variant="outline" onClick={() => quickBiteInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                    <input
                      ref={quickBiteInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("quick_bite", e.target.files[0])}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exit Rationale (PDF)</label>
                  <div className="flex gap-3">
                    <Input value={selectedFiles.exit_rationale?.name || ""} readOnly placeholder="Optional" />
                    <Button type="button" variant="outline" onClick={() => exitRationaleInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                    <input
                      ref={exitRationaleInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("exit_rationale", e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Stock Performance URL <span className="text-red-600">*</span>
                  </label>
                  <Input
                    {...register("stock_performance_url")}
                    placeholder="https://docs.google.com/spreadsheets/..."
                    className={localError.stock_performance_url ? "border-red-500" : ""}
                  />
                  {localError.stock_performance_url && (
                    <p className="text-xs text-red-600 mt-1">{localError.stock_performance_url}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Performance URLs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Stock Performance URLs <span className="text-red-600">*</span>
                </h3>
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
                  <Plus className="h-4 w-4 mr-2" /> Add Performance URL
                </Button>
              </div>
              {localError.stock_performance_url && (
                <p className="text-xs text-red-600">
                  {localError.stock_performance_url}
                </p>
              )}
              {stockPerformanceItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No performance URLs added yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Performance URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                                  stock_recommendation_url: e.target.value,
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

            {/* Iteration-specific overrides (for re-recommendations) */}
            {stockPerformanceItems.length > 1 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Iteration Details</h3>
                    <p className="text-sm text-gray-600">
                      Optional overrides per performance URL (useful when the same company is recommended more than once).
                    </p>
                  </div>
                  <div className="w-full md:w-80">
                    <label className="block text-sm font-medium mb-2">
                      Select Iteration
                    </label>
                    <Select
                      value={String(selectedIterationIndex)}
                      onValueChange={(v) => setSelectedIterationIndex(parseInt(v, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select iteration" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockPerformanceItems.map((item, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {item.date || "No date"} {item.title ? `- ${item.title}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedIterationIndex === 0 ? (
                  <p className="text-sm text-gray-600">
                    Primary iteration (0) uses the main fields above; you can add extra iterations below.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Business Note (PDF)
                        </label>
                        <div className="flex gap-3">
                          <Input
                            value={stockPerformanceItems[selectedIterationIndex]?.business_note || ""}
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => iterationBusinessNoteInputRef.current?.click()}
                            disabled={!!iterationResourceUploading[`business_note:${selectedIterationIndex}`]}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {iterationResourceUploading[`business_note:${selectedIterationIndex}`]
                              ? "Uploading..."
                              : "Upload"}
                          </Button>
                          <input
                            ref={iterationBusinessNoteInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleIterationResourceUpload("business_note", file);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Quick Bite (PDF)
                        </label>
                        <div className="flex gap-3">
                          <Input
                            value={stockPerformanceItems[selectedIterationIndex]?.quick_bite || ""}
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => iterationQuickBiteInputRef.current?.click()}
                            disabled={!!iterationResourceUploading[`quick_bite:${selectedIterationIndex}`]}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {iterationResourceUploading[`quick_bite:${selectedIterationIndex}`]
                              ? "Uploading..."
                              : "Upload"}
                          </Button>
                          <input
                            ref={iterationQuickBiteInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleIterationResourceUpload("quick_bite", file);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Exit Rationale (PDF)
                        </label>
                        <div className="flex gap-3">
                          <Input
                            value={stockPerformanceItems[selectedIterationIndex]?.exit_rationale || ""}
                            readOnly
                            placeholder="Upload to set PDF URL"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => iterationExitRationaleInputRef.current?.click()}
                            disabled={!!iterationResourceUploading[`exit_rationale:${selectedIterationIndex}`]}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {iterationResourceUploading[`exit_rationale:${selectedIterationIndex}`]
                              ? "Uploading..."
                              : "Upload"}
                          </Button>
                          <input
                            ref={iterationExitRationaleInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                handleIterationResourceUpload("exit_rationale", file);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Video URL
                        </label>
                        <Input
                          value={stockPerformanceItems[selectedIterationIndex]?.video || ""}
                          onChange={(e) => updateIterationField("video", e.target.value)}
                          placeholder="https://www.youtube.com/..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Quarterly Updates</h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setIterationQuarterlyUpdates(selectedIterationIndex, [
                                ...getIterationQuarterlyUpdates(selectedIterationIndex),
                                { date: "", title: "", description: "", pdf_url: "" },
                              ])
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </div>
                        {getIterationQuarterlyUpdates(selectedIterationIndex).length === 0 ? (
                          <p className="text-sm text-gray-500">No quarterly updates for this iteration.</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>PDF</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getIterationQuarterlyUpdates(selectedIterationIndex).map((update, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={update.date}
                                      onChange={(e) => {
                                        const next = [...getIterationQuarterlyUpdates(selectedIterationIndex)];
                                        next[index] = { ...next[index], date: e.target.value };
                                        setIterationQuarterlyUpdates(selectedIterationIndex, next);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={update.title}
                                      placeholder="Title"
                                      onChange={(e) => {
                                        const next = [...getIterationQuarterlyUpdates(selectedIterationIndex)];
                                        next[index] = { ...next[index], title: e.target.value };
                                        setIterationQuarterlyUpdates(selectedIterationIndex, next);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Textarea
                                      value={update.description}
                                      placeholder="Description"
                                      rows={2}
                                      onChange={(e) => {
                                        const next = [...getIterationQuarterlyUpdates(selectedIterationIndex)];
                                        next[index] = { ...next[index], description: e.target.value };
                                        setIterationQuarterlyUpdates(selectedIterationIndex, next);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={iterationQuarterlyUploading[`${selectedIterationIndex}:${index}`]}
                                        onClick={() => iterationQuarterlyPdfInputRefs.current[index]?.click()}
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {iterationQuarterlyUploading[`${selectedIterationIndex}:${index}`]
                                          ? "Uploading..."
                                          : "Upload PDF"}
                                      </Button>
                                      <input
                                        ref={(el) => (iterationQuarterlyPdfInputRefs.current[index] = el)}
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
                                      {update.pdf_url && (
                                        <a
                                          href={update.pdf_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600"
                                        >
                                          View PDF
                                        </a>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600"
                                      onClick={() => {
                                        const next = getIterationQuarterlyUpdates(selectedIterationIndex).filter(
                                          (_, i) => i !== index
                                        );
                                        setIterationQuarterlyUpdates(selectedIterationIndex, next);
                                      }}
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
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quarterly Updates */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Quarterly Updates</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setQuarterlyUpdates([...quarterlyUpdates, { date: "", title: "", description: "", pdf_url: "" }])
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Update
                </Button>
              </div>

              {quarterlyUpdates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No quarterly updates added yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarterlyUpdates.map((update, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="date"
                            value={update.date}
                            onChange={(e) =>
                              setQuarterlyUpdates((prev) => {
                                const arr = [...prev];
                                arr[index].date = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={update.title}
                            placeholder="Title"
                            onChange={(e) =>
                              setQuarterlyUpdates((prev) => {
                                const arr = [...prev];
                                arr[index].title = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={update.description}
                            placeholder="Description"
                            rows={2}
                            onChange={(e) =>
                              setQuarterlyUpdates((prev) => {
                                const arr = [...prev];
                                arr[index].description = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={quarterlyUploading[index]}
                              onClick={() => quarterlyPdfInputRefs.current[index]?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {quarterlyUploading[index] ? "Uploading..." : "Upload PDF"}
                            </Button>
                            <input
                              ref={(el) => (quarterlyPdfInputRefs.current[index] = el)}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleQuarterlyPdfUpload(index, e.target.files[0])}
                            />
                            {update.pdf_url && (
                              <a href={update.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                                View PDF
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => setQuarterlyUpdates(quarterlyUpdates.filter((_, i) => i !== index))}
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

            {/* Announcements */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Announcements & Updates</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAnnouncements([...announcements, { date: "", title: "", description: "", pdf_url: "" }])
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Announcement
                </Button>
              </div>

              {announcements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No announcements added yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              setAnnouncements((prev) => {
                                const arr = [...prev];
                                arr[index].date = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.title}
                            placeholder="Title"
                            onChange={(e) =>
                              setAnnouncements((prev) => {
                                const arr = [...prev];
                                arr[index].title = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={item.description}
                            placeholder="Description"
                            rows={2}
                            onChange={(e) =>
                              setAnnouncements((prev) => {
                                const arr = [...prev];
                                arr[index].description = e.target.value;
                                return arr;
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={announcementUploading[index]}
                              onClick={() => announcementPdfInputRefs.current[index]?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {announcementUploading[index] ? "Uploading..." : "Upload PDF"}
                            </Button>
                            <input
                              ref={(el) => (announcementPdfInputRefs.current[index] = el)}
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleAnnouncementPdfUpload(index, e.target.files[0])}
                            />
                            {item.pdf_url && (
                              <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                                View PDF
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => setAnnouncements(announcements.filter((_, i) => i !== index))}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Recommendation"}
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-6 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddRecommendationModal;
