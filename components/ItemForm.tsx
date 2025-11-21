"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/storage";
import { createItem, updateItem } from "@/app/actions/items";
import { useRouter } from "next/navigation";

const CATEGORIES = ["ELECTRONICS", "BOOKS", "CLOTHING", "ACCESSORIES", "DOCUMENTS", "KEYS", "BAGS", "SPORTS", "OTHER"];

interface ItemFormProps {
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    contactNumber: string;
    status: string;
    imageUrl?: string | null;
  };
  onSuccess?: () => void;
}

export default function ItemForm({ mode = "create", initialData, onSuccess }: ItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Upload image if a new one is selected
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        formData.set("imageUrl", imageUrl);
      } else if (initialData?.imageUrl) {
        formData.set("imageUrl", initialData.imageUrl);
      }

      let result;
      if (mode === "create") {
        result = await createItem(formData);
      } else if (initialData?.id) {
        result = await updateItem(initialData.id, formData);
      }

      if (result?.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        setError(result?.error || "An error occurred");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input type="text" id="title" name="title" required defaultValue={initialData?.title} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Black Backpack" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea id="description" name="description" required rows={4} defaultValue={initialData?.description} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Provide detailed description..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select id="category" name="category" required defaultValue={initialData?.category} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select id="status" name="status" required defaultValue={initialData?.status} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input type="text" id="location" name="location" required defaultValue={initialData?.location} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Library 2nd Floor" />
      </div>

      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Contact Number *
        </label>
        <input type="tel" id="contactNumber" name="contactNumber" required defaultValue={initialData?.contactNumber} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., +1234567890" />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {imagePreview && (
          <div className="mt-3">
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs h-48 object-cover rounded-md" />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Saving..." : mode === "create" ? "Create Item" : "Update Item"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
