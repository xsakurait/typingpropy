"use client";

import React from 'react';
import { KEY_MAP } from '../constants/keyboard';

interface VirtualKeyboardProps {
    nextKey: string | null;
}

const ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Space']
];

export default function VirtualKeyboard({ nextKey }: VirtualKeyboardProps) {
    const isHighlighted = (k: string) => {
        if (!nextKey) return false;
        if (k.toLowerCase() === nextKey.toLowerCase()) return true;
        if (k === 'Space' && nextKey === ' ') return true;
        return false;
    };

    const getKeyStyle = (key: string) => {
        const styles: React.CSSProperties = {};
        if (key === 'Backspace') styles.width = '7rem';
        if (key === 'Tab' || key === '\\') styles.width = '5rem';
        if (key === 'Caps') styles.width = '6rem';
        if (key === 'Enter') styles.width = '7rem';
        if (key === 'Shift') styles.width = '8.5rem';
        if (key === 'Space') {
            styles.width = '24rem';
            styles.flexGrow = 1;
        }
        return styles;
    };

    return (
        <div className="keyboard">
            {ROWS.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map((key, j) => (
                        <div 
                            key={j} 
                            className={`key ${isHighlighted(key) ? 'highlighted' : ''}`}
                            style={getKeyStyle(key)}
                        >
                            {key === 'Space' ? '' : key.toUpperCase()}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
