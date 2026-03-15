"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TypingGame from '../../../../components/TypingGame';
import { Lesson } from '../../../../types/lesson';
import { API_BASE_URL } from '../../../../constants/api';

export default function LessonPage() {
  const params = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        // 1. まずはサーバー（AWS）から取得を試みる
        const res = await fetch(`${API_BASE_URL}api/lessons`);
        if (res.ok) {
          const lessons: Lesson[] = await res.json();
          const found = lessons.find(l => l.id.toString() === id);
          if (found) {
            setLesson(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("API fetch error:", err);
      }

      // 2. サーバーになければローカルストレージを探す
      const custom: Lesson[] = JSON.parse(localStorage.getItem('custom-lessons') || '[]');
      const foundLocal = custom.find(l => l.id.toString() === id);
      
      if (foundLocal) {
        setLesson(foundLocal);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Lesson Not Found</h1>
        <a href="/" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200">Return to Home</a>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <TypingGame lesson={lesson} />
    </main>
  );
}
