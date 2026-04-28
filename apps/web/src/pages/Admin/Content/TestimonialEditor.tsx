import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { testimonialApi } from "@/api/content";
import { Testimonial } from "@repo/types";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
import { AppRoutes } from "@/routes/app-routes";

const TestimonialEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, isLoading: accessLoading } =
    useSectionEditAccess("content_testimonials");
  const [initialData, setInitialData] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  const [formData, setFormData] = useState({
    title: "",
    review: "",
    name: "",
    position: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadTestimonial();
    }
  }, [id]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        review: initialData.review || initialData.text || "",
        name: initialData.name || "",
        position: initialData.position || "",
      });
    }
  }, [initialData]);

  const loadTestimonial = async () => {
    try {
      setIsLoading(true);
      const data = await testimonialApi.getById(id!);
      setInitialData(data);
    } catch (error: any) {
      toast.error("Failed to load testimonial");
      navigate("/admin/content/testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.review.trim() || !formData.name.trim() || !formData.position.trim()) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        text: formData.review,
        name: formData.name,
        position: formData.position,
      };
      if (id) {
        await testimonialApi.update(id, dataToSave);
        toast.success("Testimonial updated successfully");
      } else {
        await testimonialApi.create(dataToSave);
        toast.success("Testimonial created successfully");
      }
      navigate("/admin/content/testimonials");
    } catch (error: any) {
      toast.error(error.message || "Failed to save testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  if (accessLoading || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return <Navigate to={AppRoutes.adminTestimonialManagement} replace />;
  }

  const getTitle = () => {
    const action = id ? "Edit" : "Create";
    return `${action} Testimonial`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary">{getTitle()}</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Save className="h-4 w-4 mr-2" />
          {"Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter testimonial title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review *</Label>
            <textarea
              id="review"
              value={formData.review}
              onChange={(e) => handleInputChange("review", e.target.value)}
              placeholder="Enter testimonial review"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter person's name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="Enter person's position"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialEditor;
