'use server';

import { API_BASE_URL } from '../constants/api';
import { Lesson } from '../types/lesson';
import { revalidatePath } from 'next/cache';

export async function saveLesson(lesson: Omit<Lesson, 'id' | 'createdAt'>) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson),
    });
    
    if (!res.ok) {
        throw new Error("Failed to save lesson");
    }
    
    revalidatePath('/');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
