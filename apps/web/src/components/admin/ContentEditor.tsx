import Editor from "@/components/core/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/stores/editor-store";
import { ArrowLeft, Eye, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export type ContentType = "newsletters" | "webinars" | "podcasts";

interface ContentEditorProps {
  type: ContentType;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  type,
  initialData,
  onSave,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const editorStore = useEditorStore();

  const [formData, setFormData] = useState({
    title: "",
    sub_title: "",
    headline_image_url: "",
    contents: "",
    footer_content: "",
    video_url: "",
    is_premium: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        sub_title: initialData.sub_title || "",
        headline_image_url: initialData.headline_image_url || "",
        contents: initialData.contents || "",
        footer_content: initialData.footer_content || "",
        video_url: initialData.video_url || "",
        is_premium: initialData.is_premium || false,
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ ...formData, contents: editorStore.editor.getHTML() });
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${isEdit ? "updated" : "created"} successfully`
      );
      navigate(-1);
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    const action = isEdit ? "Edit" : "Create";
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    return `${action} ${typeName}`;
  };

  const renderFields = () => {
    const fields = [];

    // Title (required for all)
    fields.push(
      <div key="title" className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder={`Enter ${type} title`}
        />
      </div>
    );

    // Sub title (newsletter only)
    if (type === "newsletters") {
      fields.push(
        <div key="sub_title" className="space-y-2">
          <Label htmlFor="sub_title">Sub Title</Label>
          <Input
            id="sub_title"
            value={formData.sub_title}
            onChange={(e) => handleInputChange("sub_title", e.target.value)}
            placeholder="Enter sub title"
          />
        </div>
      );
    }

    // Headline image (newsletter only)
    if (type === "newsletters") {
      fields.push(
        <div key="headline_image_url" className="space-y-2">
          <Label htmlFor="headline_image_url">Headline Image URL</Label>
          <Input
            id="headline_image_url"
            value={formData.headline_image_url}
            onChange={(e) =>
              handleInputChange("headline_image_url", e.target.value)
            }
            placeholder="Enter image URL"
          />
        </div>
      );
    }

    // Video URL (webinar and podcast)
    if (type === "webinars" || type === "podcasts") {
      fields.push(
        <div key="video_url" className="space-y-2">
          <Label htmlFor="video_url">Video URL</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => handleInputChange("video_url", e.target.value)}
            placeholder="Enter video URL"
          />
        </div>
      );
    }

    if (type === "webinars") {
      fields.push(
        <div key="is_premium" className="flex gap-x-2 group">
          <Input
            id="is_premium"
            type="checkbox"
            checked={formData.is_premium}
            className="w-4 h-4 cursor-pointer"
            onChange={(e) => handleInputChange("is_premium", e.target.checked)}
            placeholder="Is this premium?"
          />
          <Label htmlFor="is_premium" className="mt-0.5 cursor-pointer">
            Is Premium
          </Label>
        </div>
      );
    }

    return fields;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary">{getTitle()}</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                html_content: editorStore.editor.getHTML(),
              }));
              setIsPreview(!isPreview);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">{renderFields()}</CardContent>
          </Card>

          {/* Footer content for newsletter */}
          {type === "newsletters" && (
            <Card>
              <CardHeader>
                <CardTitle>Footer Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="footer_content">Footer Content</Label>
                  <textarea
                    id="footer_content"
                    value={formData.footer_content}
                    onChange={(e) =>
                      handleInputChange("footer_content", e.target.value)
                    }
                    placeholder="Enter footer content"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {isPreview ? (
                <div className="simple-editor-wrapper">
                  <div className="simple-editor-content">
                    <div
                      className={formData.contents ? "tiptap ProseMirror simple-editor prose max-w-none mb-0.5" : ""}
                      dangerouslySetInnerHTML={{
                        __html: formData.contents,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Editor contents={formData?.contents} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
