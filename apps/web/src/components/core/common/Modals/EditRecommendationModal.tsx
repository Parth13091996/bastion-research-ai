import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Plus, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "../../../../api/axios"; // Adjust path as needed
import { endpoints } from "@/api/endpoints"; // Adjust path as needed
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

const recommendationSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  nseSymbol: z.string().optional(),
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
  logo: z.string().optional(),
  business_note: z.string().optional(),
  quick_bite: z.string().optional(),
  video: z.string().optional(),
  stock_performance_url: z.string().optional(),
  exit_rationale: z.string().optional(),
  quarterly_update: z.string().optional(),
  announcements_and_update: z.string().optional(),
});

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
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [quarterlyUpdates, setQuarterlyUpdates] = useState<UpdateItem[]>([]);
  const [announcements, setAnnouncements] = useState<UpdateItem[]>([]);
  const [editingQuarterly, setEditingQuarterly] = useState<number | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
  });

  useEffect(() => {
    if (open && record) {
      reset({
        companyName: record.companyName || "",
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
        stock_performance_url: record?.stock_performance_url || "",
        latestMcapCr: String(record.latestMcapCr || ""),
        logo: (record as any).logo || "",
        business_note: record.business_note || "",
        quick_bite: record.quick_bite || "",
        video: record.video || "",
        exit_rationale: record.exit_rationale || "",
      });
      setQuarterlyUpdates(record.quarterly_update || []);
      setAnnouncements(record.announcements_and_update || []);
    } else if (!open) {
      reset();
      setQuarterlyUpdates([]);
      setAnnouncements([]);
    }
  }, [open, record, reset]);

  const handleFileUpload = async (fieldName: string, file: File) => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        endpoints.files.upload,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setValue(fieldName as any, response.data.url);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
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

  const onSubmit = async (data: RecommendationFormValues) => {
    try {
      const updatedData = {
        logo: data.logo,
        business_note: data.business_note,
        quick_bite: data.quick_bite,
        video: data.video,
        exit_rationale: data.exit_rationale,
        quarterly_update: quarterlyUpdates,
        announcements_and_update: announcements,
        stock_performance_url: data.stock_performance_url,
      };

      await onSave(updatedData);
    } catch (error: any) {
      console.error("Update error:", error);
    }
  };

  if (!record) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-6xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Recommendation - {record.companyName} ({record.nseSymbol})
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Update additional fields for this recommendation. Sheet data
            (company name, prices, etc.) is read-only. Upload PDFs and manage
            quarterly updates and announcements.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Sheet Data (Read-Only)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Company:</label>
                  <p className="font-medium">{record.companyName}</p>
                </div>
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
                  <p className="font-medium">{record.percentReturn}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Logo & Documents</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Company Logo (Image URL)
                  </label>
                  <div className="flex gap-2">
                    <Input {...register("logo")} placeholder="Logo image URL" />
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
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("logo", file);
                        }}
                      />
                    </label>
                  </div>
                  {watch("logo") && (
                    <div className="mt-2">
                      <img
                        src={watch("logo")}
                        alt="Logo preview"
                        className="h-16 w-16 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Note (PDF)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register("business_note")}
                      placeholder="PDF URL"
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
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("business_note", file);
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
                    <Input {...register("quick_bite")} placeholder="PDF URL" />
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
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("quick_bite", file);
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
                      placeholder="PDF URL"
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
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("exit_rationale", file);
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
                    Stock Performance URL
                  </label>
                  <Input
                    {...register("stock_performance_url")}
                    placeholder="Spreadsheet URL"
                  />
                </div>
              </div>
            </div>
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
                          <TableHead className="w-[200px]">PDF URL</TableHead>
                          <TableHead className="w-[100px] text-center">
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
                                  <Input
                                    value={update.pdf_url}
                                    onChange={(e) =>
                                      handleUpdateQuarterlyUpdate(
                                        index,
                                        "pdf_url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="text-sm"
                                  />
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
                          <TableHead className="w-[200px]">PDF URL</TableHead>
                          <TableHead className="w-[100px] text-center">
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
                                  <Input
                                    value={announcement.pdf_url}
                                    onChange={(e) =>
                                      handleUpdateAnnouncement(
                                        index,
                                        "pdf_url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="text-sm"
                                  />
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
