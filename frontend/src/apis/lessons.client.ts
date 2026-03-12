import { API_BASE_URL } from '../constants/api';
import { Lesson } from '../types/lesson';

export const fetchLessons = async (): Promise<Lesson[]> => {
  const res = await fetch(`${API_BASE_URL}/api/lessons`);
  if (!res.ok) return [];
  return res.json();
};
