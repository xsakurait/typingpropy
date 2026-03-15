import { API_BASE_URL } from '../constants/api';
import { Lesson } from '../types/lesson';

export const getLessons = async (): Promise<Lesson[]> => {
  try {
    const url = `${API_BASE_URL}api/lessons`;
    const res = await fetch(url, { 
      cache: 'no-store',
      next: { revalidate: 0 } 
    });
    if (!res.ok) {
        console.error(`Fetch failed with status: ${res.status} at ${url}`);
        return [];
    }
    return res.json();
  } catch (err) {
    console.error("Failed to fetch lessons:", err);
    return [];
  }
};

export const getLesson = async (id: string): Promise<Lesson | null> => {
  try {
    const lessons = await getLessons();
    return lessons.find(l => l.id.toString() === id) || null;
  } catch (err) {
    console.error("Failed to get lesson detail:", err);
    return null;
  }
};
