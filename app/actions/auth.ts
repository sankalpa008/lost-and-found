"use server";

import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, setSessionCookie, clearSessionCookie, deleteSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signUp(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "STUDENT",
      },
    });

    // Create session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error("Signin error:", error);
    return { success: false, error: "Failed to sign in" };
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      await deleteSession(token);
    }

    await clearSessionCookie();
    revalidatePath("/");
  } catch (error) {
    console.error("Signout error:", error);
  }

  redirect("/login");
}
