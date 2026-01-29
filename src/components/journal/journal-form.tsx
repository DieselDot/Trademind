"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createJournalEntry, updateJournalEntry, uploadJournalImage } from "@/app/(app)/journal/actions";
import type { JournalEntry } from "@/types/database";

interface JournalFormProps {
  children: React.ReactNode;
  entry?: JournalEntry | null;
}

export function JournalForm({ children, entry }: JournalFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState(entry?.image_url || "");
  const [imagePreview, setImagePreview] = useState(entry?.image_url || "");

  const isEditing = !!entry;

  const resetForm = () => {
    if (!isEditing) {
      setTitle("");
      setContent("");
      setDate(new Date().toISOString().split("T")[0]);
      setImageUrl("");
      setImagePreview("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadJournalImage(formData);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      setImagePreview("");
      return;
    }

    setImageUrl(result.url || "");
    toast.success("Image uploaded");
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && entry) {
        const result = await updateJournalEntry(entry.id, {
          title: title.trim(),
          content: content.trim(),
          date,
          image_url: imageUrl || null,
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Entry updated");
      } else {
        const result = await createJournalEntry({
          title: title.trim(),
          content: content.trim(),
          date,
          image_url: imageUrl || null,
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Entry created");
      }

      resetForm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Lessons from today's trades"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Write about your trading day, insights, lessons learned..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Chart Screenshot (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload an image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            {loading ? "Saving..." : isEditing ? "Update Entry" : "Create Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
