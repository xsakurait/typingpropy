"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import VirtualKeyboard from './VirtualKeyboard';
import HandsVisualizer from './HandsVisualizer';
import { saveResult } from '../actions/saveResult';
import { Clock, Target, Zap, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { KEY_MAP, Finger } from '../constants/keyboard';
import { Lesson } from '../types/lesson';


const isJapanese = (ch: string) => ch.charCodeAt(0) >= 0x3040;


function getFingers(ch: string | null): Finger[] {
  if (!ch) return [];
  if (ch === ' ')  return ['left-thumb', 'right-thumb'];   
  if (ch === '\n') return ['right-pinky'];                  
  const jpMap: Record<string, Finger> = {
    'あ':'right-pinky','ア':'right-pinky',
    'い':'right-middle','イ':'right-middle',
    'う':'right-index', 'ウ':'right-index',
    'え':'right-middle','エ':'right-middle',
    'お':'right-ring',  'オ':'right-ring',
    'ん':'right-index', 'っ':'left-index',
    'ー':  'right-pinky',
  };
  if (jpMap[ch]) return [jpMap[ch]];
  
  const k = KEY_MAP[ch.toLowerCase()];
  return k ? [k.finger] : [];
}


function getNextKey(ch: string | null): string | null {
  if (!ch) return null;
  if (ch === '\n') return 'Enter';  
  if (ch.charCodeAt(0) < 128) return ch;
  return null;
}

export default function TypingGame({ lesson }: { lesson: Lesson }) {
  const { currentIndex, charStates, stats, handleInput, nextChar } = useTypingEngine(lesson.content);
  const nextCharRef = useRef<string | null>(nextChar);
  useEffect(() => { nextCharRef.current = nextChar; }, [nextChar]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  const [flashError, setFlashError] = useState(false);
  const [penaltyDisplay, setPenaltyDisplay] = useState(0);

  
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.value = '';
    el.focus();
  }, []);

  
  useEffect(() => {
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (composingRef.current) return;
      if (stats.endTime) return;

      const ignored = [
        'Shift','Control','Alt','Meta','CapsLock','Tab','Escape',
        'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
        'Backspace','Delete','Home','End','PageUp','PageDown',
        'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Process',
      ];
      if (ignored.includes(e.key)) return;

      
      if (e.key === ' ') e.preventDefault();

      
      let input: string | null = null;
      if (e.key === 'Enter') input = '\n';
      else if (e.key.length === 1) input = e.key;
      if (!input) return;

      
      
      const nc = nextCharRef.current;
      if (nc && isJapanese(nc) && /^[a-zA-Z\-]$/.test(input)) return;

      const correct = handleInput(input, false);
      if (!correct) {
        setFlashError(true);
        setPenaltyDisplay(p => p + 1);
        setTimeout(() => setFlashError(false), 300);
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [handleInput, stats.endTime]);

  
  const onCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    composingRef.current = false;
    const composed = e.data;
    if (!composed) return;

    
    let anyWrong = false;
    for (const ch of composed) {
      const correct = handleInput(ch, false);
      if (!correct) anyWrong = true;
    }

    if (anyWrong) {
      setFlashError(true);
      setPenaltyDisplay(p => p + 1);
      setTimeout(() => setFlashError(false), 300);
    }

    
    if (inputRef.current) inputRef.current.value = '';
  }, [handleInput]);

  
  const handlePageClick = useCallback(() => inputRef.current?.focus(), []);

  
  useEffect(() => {
    if (stats.endTime && stats.wpm > 0) saveResult(stats.wpm);
  }, [stats.endTime, stats.wpm]);

  
  const [liveTime, setLiveTime] = useState(0);
  useEffect(() => {
    if (!stats.startTime || stats.endTime) return;
    const id = setInterval(() => setLiveTime((Date.now() - stats.startTime!) / 1000), 100);
    return () => clearInterval(id);
  }, [stats.startTime, stats.endTime]);

  const rawTime = stats.endTime
    ? (stats.endTime - stats.startTime!) / 1000
    : stats.startTime ? liveTime : 0;
  const displayTime = rawTime + (stats.endTime ? stats.penaltySeconds : penaltyDisplay);

  
  const nextKeyFingers = getFingers(nextChar);
  const nextKey = getNextKey(nextChar);

  const isSpace = nextChar === ' ';
  const isEnter = nextChar === '\n';
  const isJP    = nextChar ? isJapanese(nextChar) : false;

  // Calculate which line the cursor is on
  let currentLineIndex = 0;
  let acc = 0;
  const contentLines = lesson.content.split('\n');
  for (let i = 0; i < contentLines.length; i++) {
    const lineLen = contentLines[i].length + 1; // +1 for newline
    if (currentIndex < acc + lineLen) {
      currentLineIndex = i;
      break;
    }
    acc += lineLen;
  }

  // Ref for the lines container to handle auto-scrolling
  const linesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = linesContainerRef.current;
    if (!container) return;
    const currentLineEl = container.children[currentLineIndex] as HTMLElement;
    if (currentLineEl) {
      container.scrollTo({
        top: currentLineEl.offsetTop - container.clientHeight / 2 + currentLineEl.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex]);

  // const contentLines = lesson.content.split('\n');
  let charIdx = 0;
  const lines = contentLines.map(line => {
    const span = charStates.slice(charIdx, charIdx + line.length);
    charIdx += line.length + 1;
    return span;
  });

  return (
    <div
      className="container fade-in"
      style={{ padding: '0.5rem 1rem', height: '100vh', justifyContent: 'flex-start', gap: '0.5rem', overflow: 'hidden' }}
      onClick={handlePageClick}
    >
      {}
      <textarea
        ref={inputRef}
        style={{ position: 'fixed', left: '50%', top: '50%', width: '1px', height: '1px', opacity: 0, zIndex: -1 }}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onChange={() => {}}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Header Area (More compact) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', marginBottom: '-0.2rem' }}>
        <Link href="/" className="tab-button" style={{ textDecoration: 'none', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
          <ArrowLeft size={12} />
          教材一覧
        </Link>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <StatCard icon={<Clock size={12} />}  label="TIME" value={`${displayTime.toFixed(1)}s`} />
          <StatCard icon={<Zap size={12} />}    label="WPM"  value={stats.wpm} />
          <StatCard icon={<Target size={12} />} label="ACC"  value={`${stats.accuracy}%`} />
          {penaltyDisplay > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)',
              borderRadius: '1rem', padding: '0.4rem 0.7rem',
              display: 'flex', alignItems: 'center', gap: '0.2rem',
              color: '#ef4444', fontWeight: 900, fontSize: '0.75rem',
            }}>
              <AlertCircle size={12} />
              +{penaltyDisplay}s
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--slate-800)', margin: 0 }}>{lesson.title}</h2>
          <div className="card-lang" style={{ marginTop: '0.1rem', padding: '0.1rem 0.4rem', fontSize: '0.5rem', display: 'inline-block' }}>
            {lesson.language.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Code Display Area (Slightly shorter height) */}
      <div
        className="glass-panel"
        style={{
          padding: 0, width: '100%', maxWidth: '1000px',
          height: '210px', // Reduced height
          display: 'flex',
          background: flashError ? '#fff5f5' : 'white',
          cursor: 'text',
          transition: 'background 0.15s',
          outline: flashError ? '2px solid rgba(239,68,68,0.35)' : 'none',
          position: 'relative',
        }}
      >
        {/* Line Numbers Panel */}
        <div style={{
          padding: '1rem 0.6rem', background: 'rgba(14,165,233,0.03)',
          borderRight: '1px solid var(--slate-100)',
          textAlign: 'right', color: 'var(--slate-200)',
          fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: '0.65rem',
          minWidth: '38px', userSelect: 'none',
          overflow: 'hidden'
        }}>
          <div style={{ 
              transform: `translateY(${-((linesContainerRef.current?.scrollTop || 0))}px)`,
              transition: 'transform 0.1s' 
          }}>
            {lines.map((_, i) => (
              <div key={i} style={{ lineHeight: '1.9rem', height: '1.9rem' }}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Content Panel (The one that actually scrolls) */}
        <div 
          ref={linesContainerRef}
          style={{ 
            padding: '1rem 1.5rem', 
            flexGrow: 1, 
            fontFamily: "'Fira Code','Noto Sans JP',monospace",
            overflowY: 'auto', // Enable vertical scroll
            scrollbarWidth: 'none', // Hide scrollbar for cleaner look
            msOverflowStyle: 'none'
          }}
        >
          {lines.map((lineChars, li) => (
            <div key={li} style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                minHeight: '1.9rem', 
                lineHeight: '1.9rem', 
                alignItems: 'center',
                opacity: li === currentLineIndex ? 1 : 0.4, // Highlight current line
                transition: 'opacity 0.2s'
            }}>
              {lineChars.map((cs, ci) => (
                <span key={ci} style={{
                  color:          cs.status === 'current'   ? 'var(--slate-900)'
                                : cs.status === 'correct'   ? 'var(--primary)'
                                : cs.status === 'incorrect' ? '#ef4444'
                                : 'var(--slate-300)',
                  background:     cs.status === 'current'   ? '#fbbf24'
                                : cs.status === 'incorrect' ? 'rgba(239,68,68,0.12)'
                                : 'transparent',
                  boxShadow:      cs.status === 'current' ? '0 0 10px rgba(251,191,36,0.45)' : 'none',
                  textDecoration: cs.status === 'incorrect' ? 'underline' : 'none',
                  textUnderlineOffset: '3px',
                  borderRadius: '3px', padding: '0 1px',
                  fontSize: '1.2rem', transition: 'all 0.08s',
                  fontWeight: cs.status === 'current' ? 900 : 'normal',
                }}>
                  {cs.char === ' '  ? '\u00A0'
                  : cs.char === '\t' ? '\u00A0\u00A0\u00A0\u00A0'
                  : cs.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {}
      {(isSpace || isEnter || isJP) && (
        <div style={{
          background: isEnter ? 'rgba(99,102,241,0.08)' : isSpace ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.06)',
          border: `1.5px solid ${isEnter ? 'rgba(99,102,241,0.25)' : 'rgba(14,165,233,0.25)'}`,
          borderRadius: '0.8rem',
          padding: '0.4rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          color: isEnter ? 'var(--secondary)' : 'var(--primary)',
          fontWeight: 800, fontSize: '0.85rem',
          maxWidth: '860px', width: '100%',
        }}>
          {isEnter ? '↩ Enter キー → 右小指で！' :
           isSpace  ? '⎵ スペースキー → 左右どちらの親指でもOK！' :
                     `🇯🇵 日本語入力: ${nextChar} と入力してEnterで確定`}
        </div>
      )}

      {/* Keyboard and Hands (More compact) */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '820px', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{
          padding: '1rem', width: '100%',
          display: 'flex', justifyContent: 'center',
          background: 'rgba(255,255,255,0.45)', borderRadius: '1.2rem',
          transform: 'scale(0.88)', transformOrigin: 'top center',
        }}>
          <VirtualKeyboard nextKey={nextKey} />
        </div>

        {/* Hands Visualizer */}
        <div style={{
          position: 'absolute', bottom: '-2.8rem', left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none', opacity: 0.95,
          width: '100%', display: 'flex', justifyContent: 'center', zIndex: 20,
        }}>
          <HandsVisualizer highlightedFingers={nextKeyFingers} />
        </div>
      </div>

      {}
      {stats.endTime && (
        <div className="results-overlay fade-in">
          <div className="results-card">
            <div style={{ fontSize: '4rem', lineHeight: 1 }}>🎉</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0 0.3rem', color: 'var(--slate-900)' }}>完了！</h2>
            <p style={{ color: 'var(--slate-400)', fontWeight: 700, fontSize: '0.95rem' }}>セッション結果</p>
            {stats.penaltySeconds > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '1rem', padding: '0.7rem 1.5rem', margin: '1rem 0', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                ⚠️ ペナルティ: +{stats.penaltySeconds}秒（{stats.errorCount}回ミス）
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', margin: '1.5rem 0' }}>
              {[
                { label: 'WPM',   value: stats.wpm,                   color: 'var(--primary)' },
                { label: '正確さ', value: `${stats.accuracy}%`,        color: '#10b981' },
                { label: 'タイム', value: `${displayTime.toFixed(1)}s`, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--slate-50)', borderRadius: '1.5rem', padding: '1.2rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--slate-400)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '0.3rem' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={() => window.location.reload()} className="button-primary">
                <RotateCcw size={20} />
                もう一度チャレンジ
              </button>
              <Link href="/" className="button-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                ← 教材一覧へ戻る
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="stat-card" style={{ minWidth: '85px', padding: '0.4rem 0.6rem', gap: '0.2rem' }}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ padding: '6px' }}>{icon}</div>
        <div className="stat-label" style={{ fontSize: '0.6rem' }}>{label}</div>
      </div>
      <div className="stat-value" style={{ fontSize: '1.2rem' }}>{value}</div>
    </div>
  );
}
