"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth";

export async function getAllUsers() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Delete user and cascade delete sessions and items
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function createAdminUser(email: string, password: string, name?: string) {
  await requireAdmin();

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in Prisma with ADMIN role
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating admin user:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    return { success: false, error: errorMessage };
  }
}

export async function createStudentUser(email: string, password: string, name?: string) {
  await requireAdmin();

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in Prisma with STUDENT role
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "STUDENT",
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating student user:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    return { success: false, error: errorMessage };
  }
}
