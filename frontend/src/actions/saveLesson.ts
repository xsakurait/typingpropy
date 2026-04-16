"use server";

import { cookies } from "next/headers";
import { API_BASE_URL } from "../constants/api";
import { Lesson } from "../types/lesson";
import { revalidatePath } from "next/cache";

export async function saveLesson(lesson: Omit<Lesson, "id" | "createdAt" | "title_romaji">) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("idToken")?.value;

    const res = await fetch(`${API_BASE_URL}/api/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(lesson),
    });

    if (!res.ok) {
      throw new Error(`Failed to save lesson: ${res.status}`);
    }

    revalidatePath("/");
    return await res.json();
  } catch (error) {
    console.error("Save lesson error:", error);
    return null;
  }
}
