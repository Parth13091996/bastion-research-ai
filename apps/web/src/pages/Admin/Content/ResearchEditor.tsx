import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { researchApi } from "@/api/content";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Upload } from "lucide-react";
import axiosInstance from "@/api/axios";

const ResearchEditor: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Research>>({
    company: "",
    coverage_initiation_date: "",
    sector: "",
    action: "",
    comments: "",
    percent_return_since_recommendation: undefined,
    percent_irr_potential_from_cmp: undefined,
    research_material_url: "",
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          setLoading(true);
          const data = await researchApi.getById(id!);
          setForm(data);
        } catch (e) {
          toast.error("Failed to load research");
          navigate("/admin/content/research");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const set = (k: keyof Research, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const uploadPdf = async () => {
    if (!pdfFile) return;
    const fd = new FormData();
    fd.append("file", pdfFile);
    const { data } = await axiosInstance.post("/api/files/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    set("research_material_url", data.url);
    toast.success("PDF uploaded");
  };

  const onSave = async () => {
    if (!form.company?.trim()) {
      toast.error("Company is required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        company: form.company,
        coverage_initiation_date: form.coverage_initiation_date || null,
        sector: form.sector || null,
        action: form.action || null,
        comments: form.comments || null,
        percent_return_since_recommendation:
          form.percent_return_since_recommendation ?? null,
        percent_irr_potential_from_cmp:
          form.percent_irr_potential_from_cmp ?? null,
        research_material_url: form.research_material_url || null,
      };
      if (isEdit) {
        await researchApi.update(id!, payload);
      } else {
        await researchApi.create(payload);
      }
      toast.success(`Research ${isEdit ? "updated" : "created"}`);
      navigate(-1);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading research...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary">
            {isEdit ? "Edit" : "Create"} Research
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={form.company || ""}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverage_initiation_date">Coverage Initiation Date</Label>
              <Input
                id="coverage_initiation_date"
                type="date"
                value={form.coverage_initiation_date || ""}
                onChange={(e) => set("coverage_initiation_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={form.sector || ""}
                onChange={(e) => set("sector", e.target.value)}
                placeholder="Enter sector"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={form.action || ""}
                onChange={(e) => set("action", e.target.value)}
                placeholder="Buy / Sell / Hold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <textarea
                id="comments"
                value={form.comments || ""}
                onChange={(e) => set("comments", e.target.value)}
                placeholder="Enter comments"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prsr">% Return since Recommendation</Label>
                <Input
                  id="prsr"
                  type="number"
                  step="0.01"
                  value={(form.percent_return_since_recommendation as any) ?? ""}
                  onChange={(e) =>
                    set(
                      "percent_return_since_recommendation",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="irr">% IRR Potential from CMP</Label>
                <Input
                  id="irr"
                  type="number"
                  step="0.01"
                  value={(form.percent_irr_potential_from_cmp as any) ?? ""}
                  onChange={(e) =>
                    set(
                      "percent_irr_potential_from_cmp",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Material (PDF)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf">Upload PDF</Label>
              <Input
                id="pdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              <Button variant="outline" onClick={uploadPdf} disabled={!pdfFile}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {form.research_material_url && (
              <div className="text-sm text-gray-700 break-all">
                Uploaded: <a className="underline" href={form.research_material_url} target="_blank" rel="noreferrer">{form.research_material_url}</a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResearchEditor;

