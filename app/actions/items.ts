"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Category, ItemStatus } from "@prisma/client";

export async function createItem(formData: FormData) {
  const user = await requireAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as Category;
  const location = formData.get("location") as string;
  const contactNumber = formData.get("contactNumber") as string;
  const status = formData.get("status") as ItemStatus;
  const imageUrl = formData.get("imageUrl") as string;

  try {
    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        location,
        contactNumber,
        status,
        imageUrl,
        userId: user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateItem(itemId: string, formData: FormData) {
  const user = await requireAuth();

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  // Check if user owns the item or is admin
  if (item.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as Category;
  const location = formData.get("location") as string;
  const contactNumber = formData.get("contactNumber") as string;
  const status = formData.get("status") as ItemStatus;
  const imageUrl = formData.get("imageUrl") as string | null;

  try {
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        title,
        description,
        category,
        location,
        contactNumber,
        status,
        ...(imageUrl && { imageUrl }),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/items/${itemId}`);
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Error updating item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function deleteItem(itemId: string) {
  const user = await requireAuth();

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  // Check if user owns the item or is admin
  if (item.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.item.delete({
      where: { id: itemId },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function markItemAsResolved(itemId: string, resolved: boolean) {
  const user = await requireAuth();

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  // Check if user owns the item or is admin
  if (item.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { isResolved: resolved },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/items/${itemId}`);
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Error updating item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function getItems(filters?: { search?: string; category?: Category; status?: ItemStatus; resolved?: boolean }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters?.search) {
      where.OR = [{ title: { contains: filters.search, mode: "insensitive" } }, { description: { contains: filters.search, mode: "insensitive" } }, { location: { contains: filters.search, mode: "insensitive" } }];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.resolved !== undefined) {
      where.isResolved = filters.resolved;
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export async function getItemById(itemId: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return item;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
}

export async function getUserItems() {
  const user = await requireAuth();

  try {
    const items = await prisma.item.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return items;
  } catch (error) {
    console.error("Error fetching user items:", error);
    return [];
  }
}
