import TypingGame from '../../../../components/TypingGame';
import { getLesson } from '../../../../apis/lessons.server';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  const lesson = await getLesson(unwrappedParams.id);


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
