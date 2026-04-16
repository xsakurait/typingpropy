"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Plus, Play, Code2, BookOpen, Upload, ChevronRight, Trash2
} from 'lucide-react';

import { Lesson } from '../../../types/lesson';
import { saveLesson } from '../../../actions/saveLesson';

const LANG_COLORS: Record<string, string> = {
  java:       '#f59e0b',
  typescript: '#3b82f6',
  javascript: '#eab308',
  python:     '#10b981',
  text:       '#8b5cf6',
};

interface HomeClientProps {
  initialLessons: Lesson[];
}

export default function HomeClient({ initialLessons }: HomeClientProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [activeTab, setActiveTab] = useState<'lessons' | 'import'>('lessons');

  const [importTitle, setImportTitle] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importLang, setImportLang] = useState('text');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const custom: Lesson[] = JSON.parse(localStorage.getItem('custom-lessons') || '[]');
    if (custom.length > 0) {
      setLessons(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const filteredCustom = custom.filter(l => !existingIds.has(l.id));
        return [...prev, ...filteredCustom];
      });
    }
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');
    const newLesson = { title: importTitle, content: importContent, language: importLang };

    try {
      const saved = await saveLesson(newLesson);
      if (saved) {
        setLessons(prev => [...prev, saved]);
      } else throw new Error();
    } catch {
      const localLesson: Lesson = { ...newLesson, id: Date.now().toString() };
      const custom: Lesson[] = JSON.parse(localStorage.getItem('custom-lessons') || '[]');
      localStorage.setItem('custom-lessons', JSON.stringify([...custom, localLesson]));
      setLessons(prev => [...prev, localLesson]);
    } finally {
      setIsSaving(false);
      setSaveMsg('✅ 教材を追加しました！');
      setImportTitle('');
      setImportContent('');
      setTimeout(() => {
        setSaveMsg('');
        setActiveTab('lessons');
      }, 1200);
    }
  };

  const handleDelete = (id: string) => {
    const custom: Lesson[] = JSON.parse(localStorage.getItem('custom-lessons') || '[]');
    const updated = custom.filter(l => l.id !== id);
    localStorage.setItem('custom-lessons', JSON.stringify(updated));
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const customLessons = lessons.filter(l => l.id.toString().length > 10);

  return (
    <main className="container fade-in" style={{ minHeight: '100vh', paddingTop: '3rem', paddingBottom: '3rem' }}>

      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            borderRadius: '1.5rem', padding: '1rem 2rem', marginBottom: '1.2rem',
            boxShadow: '0 10px 30px rgba(14,165,233,0.25)',
          }}>
            <Code2 size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-2px', color: 'var(--slate-900)' }}>
            Typing<span className="gradient-text">Pro</span>
          </h1>
          <p style={{ fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            日本語 • コード • タイピング
          </p>
        </div>

        <nav className="nav-container">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`tab-button ${activeTab === 'lessons' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            教材一覧
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          >
            <Plus size={18} />
            インポート
          </button>
        </nav>
      </header>

      <div style={{ width: '100%' }}>

        {activeTab === 'lessons' && (
          <div className="grid">
            {lessons.map(lesson => (
                  <Link href={`/lesson/${lesson.id}`} key={lesson.id} style={{ textDecoration: 'none' }}>
                    <div className="glass-panel card" style={{ transition: 'all 0.3s', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <div className="card-icon" style={{ marginBottom: 0 }}>
                          <Code2 size={22} />
                        </div>
                        <span
                          className="card-lang"
                          style={{
                            background: `${LANG_COLORS[lesson.language] ?? '#94a3b8'}22`,
                            color: LANG_COLORS[lesson.language] ?? 'var(--slate-400)',
                          }}
                        >
                          {lesson.language.toUpperCase()}
                        </span>
                      </div>

                      <h2 className="card-title">{lesson.title}</h2>

                      <div className="card-preview">
                        {lesson.content.slice(0, 200)}
                      </div>

                      <div className="cta-link">
                        練習を始める
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                  </Link>
                ))
            }

            {lessons.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <p style={{ color: 'var(--slate-400)', fontSize: '1.1rem', fontWeight: 700 }}>
                  教材がまだありません。インポートから追加してください。
                </p>
                <button
                  onClick={() => setActiveTab('import')}
                  className="submit-button"
                  style={{ marginTop: '2rem', maxWidth: '300px', marginInline: 'auto' }}
                >
                  <Upload size={20} />
                  教材をインポート
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="form-container">
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div className="card-icon" style={{ marginBottom: 0 }}><Upload size={22} /></div>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--slate-900)', margin: 0 }}>新規インポート</h2>
                  <p style={{ color: 'var(--slate-400)', fontWeight: 600, margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
                    日本語・記号・コードに対応
                  </p>
                </div>
              </div>

              <form onSubmit={handleImport}>
                <div className="input-group">
                  <label className="input-label">教材タイトル</label>
                  <input
                    type="text"
                    value={importTitle}
                    onChange={e => setImportTitle(e.target.value)}
                    placeholder="例: React + TypeScript 基礎"
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">言語 / ジャンル</label>
                  <select
                    value={importLang}
                    onChange={e => setImportLang(e.target.value)}
                    className="select-field"
                  >
                    <option value="text">一般テキスト / 日本語</option>
                    <option value="java">Java / Spring</option>
                    <option value="typescript">TypeScript / React</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">教材の内容</label>
                  <textarea
                    value={importContent}
                    onChange={e => setImportContent(e.target.value)}
                    placeholder="練習したいコードや、かな混じりの日本語テキストを貼り付けてください..."
                    className="textarea-field"
                    required
                  />
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.8rem', margin: '0.3rem 0 0 0.5rem' }}>
                    ひらがな・漢字・記号・英数字すべて対応しています
                  </p>
                </div>

                {saveMsg && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', color: '#059669', fontWeight: 700, textAlign: 'center' }}>
                    {saveMsg}
                  </div>
                )}

                <button type="submit" disabled={isSaving} className="submit-button">
                  {isSaving ? '保存中...' : '教材を追加する'}
                  {!isSaving && <ChevronRight size={22} />}
                </button>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <BookOpen size={20} color="var(--primary)" />
                カスタム教材一覧
              </h3>

              {customLessons.length === 0 ? (
                <p style={{ color: 'var(--slate-300)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  まだカスタム教材がありません
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {customLessons.map(l => (
                    <div
                      key={l.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--slate-50)', borderRadius: '1rem',
                        padding: '1rem 1.5rem',
                        border: '1px solid var(--slate-100)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 900,
                          color: LANG_COLORS[l.language] ?? 'var(--slate-400)',
                          background: `${LANG_COLORS[l.language] ?? '#94a3b8'}22`,
                          padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                          textTransform: 'uppercase',
                        }}>
                          {l.language}
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--slate-800)' }}>{l.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <Link
                          href={`/lesson/${l.id}`}
                          style={{
                            color: 'var(--primary)', fontWeight: 800, textDecoration: 'none',
                            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                          }}
                        >
                          <Play size={14} fill="currentColor" /> 練習
                        </Link>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(l.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '6rem', textAlign: 'center', color: 'var(--slate-300)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Typing Pro • Japanese Code Edition
      </footer>
    </main>
  );
}
