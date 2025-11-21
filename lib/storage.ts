import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function uploadImage(file: File): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads directory
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const filePath = join(uploadsDir, fileName);

  await writeFile(filePath, buffer);

  // Return relative URL
  return `/uploads/${fileName}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = imageUrl.split("/").pop();
    if (!fileName) return;

    // Delete from public/uploads directory
    const filePath = join(process.cwd(), "public", "uploads", fileName);
    await unlink(filePath);
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
}
