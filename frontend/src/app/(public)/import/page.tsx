"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ChevronRight, Code } from 'lucide-react';

export default function ImportPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [language, setLanguage] = useState("text");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, language })
            });

            if (res.ok) {
                router.push('/');
            } else {
                alert("Failed to save lesson");
            }
        } catch (error) {
            console.error(error);
            // Fallback: use localStorage for demo if backend unavailable
            const mockLessons = JSON.parse(localStorage.getItem('custom-lessons') || '[]');
            mockLessons.push({ id: Date.now(), title, content, language });
            localStorage.setItem('custom-lessons', JSON.stringify(mockLessons));
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <a href="/" className="text-accent hover:underline mb-8 inline-block">← Back to Lessons</a>
                
                <div className="glass-panel p-10 border-t-4 border-accent">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Upload className="text-accent w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-extrabold gradient-text">Import Snippet</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., My Java Lesson"
                                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Language</label>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="text" className="bg-slate-900">Plain Text / Japanese</option>
                                <option value="java" className="bg-slate-900">Java</option>
                                <option value="typescript" className="bg-slate-900">TypeScript / React</option>
                                <option value="python" className="bg-slate-900">Python</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Content (Japanese, symbols, code...)</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your code or Japanese text here..."
                                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-accent outline-none transition-all min-h-[300px] font-mono resize-none"
                                required
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`
                                mt-4 w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-accent hover:bg-cyan-400 text-slate-950 shadow-lg shadow-accent/20 active:scale-95'}
                            `}
                        >
                            {loading ? 'SAVING...' : 'IMPORT LESSON'}
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </form>
                </div>

                <div className="mt-8 p-6 glass-panel flex items-start gap-4 bg-white/5 opacity-60">
                    <Code className="text-slate-400 w-6 h-6 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Imported lessons are automatically processed. Japanese characters will be converted to Romaji sequences for practice, while symbols and alphanumeric characters remain as-is.
                    </p>
                </div>
            </div>
        </main>
    );
}
