"use client";

import { useState, useCallback, useRef } from 'react';

interface TypingStats {
    wpm: number;
    accuracy: number;
    correctCount: number;
    errorCount: number;
    startTime: number | null;
    endTime: number | null;
    penaltySeconds: number;
}

export interface CharState {
    char: string;
    status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export const useTypingEngine = (content: string) => {
    const chars = content.split('');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [charStates, setCharStates] = useState<CharState[]>(() =>
        chars.map((c, i) => ({ char: c, status: i === 0 ? 'current' : 'pending' }))
    );
    const [stats, setStats] = useState<TypingStats>({
        wpm: 0,
        accuracy: 100,
        correctCount: 0,
        errorCount: 0,
        startTime: null,
        endTime: null,
        penaltySeconds: 0,
    });

    const handleInput = useCallback((inputText: string, _isComposing: boolean): boolean => {
        if (stats.endTime) return false;

        const now = Date.now();
        const newStartTime = stats.startTime || now;

        let allCorrect = true;
        let newIndex = currentIndex;
        let newCorrect = stats.correctCount;
        let newError = stats.errorCount;
        let newPenalty = stats.penaltySeconds;
        const newStates = [...charStates];

        for (const inputChar of inputText) {
            if (newIndex >= chars.length) break;
            const expected = chars[newIndex];

            if (inputChar === expected) {
                newStates[newIndex] = { char: expected, status: 'correct' };
                newCorrect++;
                newIndex++;
                if (newIndex < chars.length) {
                    newStates[newIndex] = { ...newStates[newIndex], status: 'current' };
                }
            } else {
                newStates[newIndex] = { char: expected, status: 'incorrect' };
                newError++;
                newPenalty++;
                allCorrect = false;
                setTimeout(() => {
                    setCharStates(prev => {
                        const reset = [...prev];
                        if (reset[newIndex]?.status === 'incorrect') {
                            reset[newIndex] = { ...reset[newIndex], status: 'current' };
                        }
                        return reset;
                    });
                }, 300);
                break; 
            }
        }

        const total = newCorrect + newError;
        const newAccuracy = total > 0 ? Math.round((newCorrect / total) * 100) : 100;

        let endTime: number | null = null;
        let finalWpm = 0;
        if (newIndex >= chars.length) {
            endTime = Date.now();
            const rawDuration = (endTime - newStartTime) / 60000;
            const penaltyMinutes = newPenalty / 60;
            const totalMinutes = rawDuration + penaltyMinutes;
            finalWpm = totalMinutes > 0 ? Math.round((chars.length / 5) / totalMinutes) : 0;
        }

        setCurrentIndex(newIndex);
        setCharStates(newStates);
        setStats({
            startTime: newStartTime,
            endTime,
            correctCount: newCorrect,
            errorCount: newError,
            accuracy: newAccuracy,
            wpm: endTime ? finalWpm : stats.wpm,
            penaltySeconds: newPenalty,
        });

        return allCorrect;
    }, [chars, currentIndex, charStates, stats]);

    const nextChar = chars[currentIndex] ?? null;

    return {
        currentIndex,
        charStates,
        content,
        stats,
        handleInput,
        nextChar,
    };
};
