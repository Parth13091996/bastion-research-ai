import { uploadFile } from "@/api/files-api";
import Editor from "@/components/core/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/stores/editor-store";
import { ArrowLeft, Eye, Save, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export type ContentType =
  | "newsletters"
  | "webinars"
  | "podcasts"
  | "scratch-pad";

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
    link: "",
    contents: "",
    footer_content: "",
    video_url: "",
    is_premium: false,
    category: "",
    // Scratch pad fields
    slug: "",
    description: "",
    content: "",
    featured_image: "",
    author: "",
    published_date: "",
    is_published: false,
    tags: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({
    featured_image: false,
  });

  const handleFileUpload = async (
    fieldName: string,
    file: File,
    setValue: (value: string) => void
  ) => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "image");
      formData.append("dir", type === "scratch-pad" ? "scratchpad" : type);
      const response = await uploadFile(formData);
      setValue(response?.data?.url);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        sub_title: initialData.sub_title || "",
        headline_image_url: initialData.headline_image_url || "",
        link: initialData.link || "",
        contents: initialData.contents || "",
        footer_content: initialData.footer_content || "",
        video_url: initialData.video_url || "",
        is_premium: initialData.is_premium || false,
        category: initialData.category || "",
        // Scratch pad fields
        slug: initialData.slug || "",
        description: initialData.description || "",
        content: initialData.content || "",
        featured_image: initialData.featured_image || "",
        author: initialData.author || "",
        published_date: initialData.published_date || "",
        is_published: initialData.is_published || false,
        tags: initialData.tags || [],
      });
    }
  }, [initialData]);

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      const editorContent = editorStore.editor.getHTML();
      let dataToSave: any = { ...formData };

      // For scratch pad, map to correct database fields
      if (type === "scratch-pad") {
        dataToSave = {
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          description: formData.description,
          content: editorContent,
          featured_image: formData.featured_image,
          author: formData.author,
          published_date: formData.published_date || null,
          is_published: formData.is_published,
          tags: formData.tags,
        };
      } else {
        // For other types, use contents field
        dataToSave = { ...formData, contents: editorContent };
      }

      await onSave(dataToSave);
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

    // External URL link (newsletter only)
    if (type === "newsletters") {
      fields.push(
        <div key="link" className="space-y-2">
          <Label htmlFor="link">URL Link</Label>
          <Input
            id="link"
            value={formData.link}
            onChange={(e) => handleInputChange("link", e.target.value)}
            placeholder="Enter external newsletter URL (Substack/Mailchimp)"
          />
        </div>
      );
    }

    // Category (newsletter only)
    if (type === "newsletters") {
      fields.push(
        <div key="category" className="space-y-2">
          <Label>Category</Label>
          <div className="space-y-2">
            {[
              { value: "learning-of-the-week", label: "Learning of the Week" },
              { value: "scratch-pad", label: "Scratch Pad" },
              { value: "topical-update", label: "Topical Update" },
            ].map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={option.value}
                  name="category"
                  value={option.value}
                  checked={formData.category === option.value}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label
                  htmlFor={option.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
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

    // Scratch pad specific fields
    if (type === "scratch-pad") {
      // Description
      fields.push(
        <div key="description" className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter a brief description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );

      fields.push(
        <div key="featured_image" className="space-y-2 ">
          <Label htmlFor="featured_image">Featured Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) =>
                handleInputChange("featured_image", e.target.value)
              }
              placeholder="Enter featured image URL"
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
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    handleFileUpload("featured_image", file, (url: string) => {
                      handleInputChange("featured_image", url);
                    });
                }}
              />
            </label>
          </div>
        </div>
      );

      // Author
      fields.push(
        <div key="author" className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            placeholder="Enter author name"
          />
        </div>
      );

      // Published Date
      fields.push(
        <div key="published_date" className="space-y-2">
          <Label htmlFor="published_date">Published Date</Label>
          <Input
            id="published_date"
            type="datetime-local"
            value={
              formData.published_date
                ? new Date(formData.published_date).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              handleInputChange("published_date", e.target.value)
            }
          />
        </div>
      );

      // Is Published checkbox
      fields.push(
        <div key="is_published" className="flex gap-x-2 group">
          <Input
            id="is_published"
            type="checkbox"
            checked={formData.is_published}
            className="w-4 h-4 cursor-pointer"
            onChange={(e) =>
              handleInputChange("is_published", e.target.checked)
            }
          />
          <Label htmlFor="is_published" className="mt-0.5 cursor-pointer">
            Is Published
          </Label>
        </div>
      );

      // Tags
      fields.push(
        <div key="tags" className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
            onChange={(e) =>
              handleInputChange(
                "tags",
                e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Enter tags separated by commas"
          />
        </div>
      );
    }

    return fields;
  };

  return (
    <div className="container space-y-6 min-h-screen relative pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-wrap">
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
              let editorContent = editorStore.editor.getHTML();
              editorContent = editorContent.replace(/<p[^>]*><\/p>/g, "<br>");
              setFormData((prev) => ({
                ...prev,
                html_content: editorContent,
                ...(type === "scratch-pad"
                  ? { content: editorContent }
                  : { contents: editorContent }),
              }));
              setIsPreview(!isPreview);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {"Save"}
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
                      className={
                        (
                          type === "scratch-pad"
                            ? formData.content
                            : formData.contents
                        )
                          ? "tiptap ProseMirror simple-editor prose max-w-none mb-0.5"
                          : ""
                      }
                      dangerouslySetInnerHTML={{
                        __html:
                          type === "scratch-pad"
                            ? formData.content.replace(/<p[^>]*><\/p>/g, "<br>")
                            : formData.contents.replace(
                                /<p[^>]*><\/p>/g,
                                "<br>"
                              ),
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Editor
                  contents={
                    type === "scratch-pad"
                      ? formData?.content
                      : formData?.contents
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
