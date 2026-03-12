import { API_BASE_URL } from '../constants/api';
import { Lesson } from '../types/lesson';

export const getLessons = async (): Promise<Lesson[]> => {
  const res = await fetch(`${API_BASE_URL}/api/lessons`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
};

export const getLesson = async (id: string): Promise<Lesson | null> => {
  const lessons = await getLessons();
  return lessons.find(l => l.id.toString() === id) || null;
};
