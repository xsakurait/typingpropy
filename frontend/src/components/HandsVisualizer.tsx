"use client";

import React from 'react';
import { Finger } from '../constants/keyboard';

interface HandsVisualizerProps {
    highlightedFingers: (Finger | null) | Finger[];
}

export default function HandsVisualizer({ highlightedFingers }: HandsVisualizerProps) {
    const fingers = Array.isArray(highlightedFingers)
        ? highlightedFingers.filter(Boolean) as Finger[]
        : highlightedFingers ? [highlightedFingers] : [];
    const isHighlighted = (f: string) => fingers.includes(f as Finger);

    const hl = (path: string) => ({
        fill: 'rgba(14, 165, 233, 0.75)',
        stroke: '#0ea5e9',
        strokeWidth: 1.5,
        d: path,
    });

    return (
        <div style={{ display: 'flex', gap: '3rem', transform: 'scale(0.75)', transformOrigin: 'top center' }}>

            {/* ── Left Hand ── */}
            <div style={{ position: 'relative' }}>
                <svg width={240} height={280} viewBox="0 0 240 280" overflow="visible">
                    {/* Palm */}
                    <path
                        d="M30,240 L30,175 C30,175 28,160 40,158 C52,156 55,168 55,175
                           L55,190 L70,110 C70,90 80,82 92,82 C104,82 108,92 108,110
                           L108,175 L117,82 C117,62 127,54 139,54 C151,54 155,64 155,82
                           L155,175 L163,100 C163,80 173,72 185,72 C197,72 200,84 200,100
                           L200,185
                           Q215,185 222,196 Q232,212 218,240 L200,255 L30,255 Z"
                        fill="white" stroke="#2d3748" strokeWidth="2" strokeLinejoin="round"
                    />
                    {/* Thumb */}
                    <path
                        d="M200,185 Q218,183 228,198 Q240,215 224,245 L208,255 L200,240 Z"
                        fill="white" stroke="#2d3748" strokeWidth="2" strokeLinejoin="round"
                    />
                    {/* Finger joint lines for realism */}
                    <line x1="55" y1="160" x2="55" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="108" y1="140" x2="108" y2="110" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="155" y1="130" x2="155" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="200" y1="140" x2="200" y2="115" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Highlights */}
                    {isHighlighted('left-pinky') && <path {...hl("M30,240 L30,175 C30,175 28,160 40,158 C52,156 55,168 55,175 L55,190 L30,190 Z")} />}
                    {isHighlighted('left-ring') && <path {...hl("M55,190 L70,110 C70,90 80,82 92,82 C104,82 108,92 108,110 L108,175 L55,175 Z")} />}
                    {isHighlighted('left-middle') && <path {...hl("M108,175 L117,82 C117,62 127,54 139,54 C151,54 155,64 155,82 L155,175 L108,175 Z")} />}
                    {isHighlighted('left-index') && <path {...hl("M155,175 L163,100 C163,80 173,72 185,72 C197,72 200,84 200,100 L200,185 L155,185 Z")} />}
                    {isHighlighted('left-thumb') && <path {...hl("M200,185 Q218,183 228,198 Q240,215 224,245 L208,255 L200,240 Z")} />}
                </svg>
            </div>

            {/* ── Right Hand ── */}
            <div style={{ position: 'relative' }}>
                <svg width={240} height={280} viewBox="0 0 240 280" overflow="visible">
                    {/* Palm (mirrored) */}
                    <path
                        d="M210,240 L210,175 C210,175 212,160 200,158 C188,156 185,168 185,175
                           L185,190 L170,110 C170,90 160,82 148,82 C136,82 132,92 132,110
                           L132,175 L123,82 C123,62 113,54 101,54 C89,54 85,64 85,82
                           L85,175 L77,100 C77,80 67,72 55,72 C43,72 40,84 40,100
                           L40,185
                           Q25,185 18,196 Q8,212 22,240 L40,255 L210,255 Z"
                        fill="white" stroke="#2d3748" strokeWidth="2" strokeLinejoin="round"
                    />
                    {/* Thumb (mirrored) */}
                    <path
                        d="M40,185 Q22,183 12,198 Q0,215 16,245 L32,255 L40,240 Z"
                        fill="white" stroke="#2d3748" strokeWidth="2" strokeLinejoin="round"
                    />
                    {/* Joint lines */}
                    <line x1="185" y1="160" x2="185" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="132" y1="140" x2="132" y2="110" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="85" y1="130" x2="85" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="40" y1="140" x2="40" y2="115" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Highlights */}
                    {isHighlighted('right-pinky') && <path {...hl("M210,240 L210,175 C210,175 212,160 200,158 C188,156 185,168 185,175 L185,190 L210,190 Z")} />}
                    {isHighlighted('right-ring') && <path {...hl("M185,190 L170,110 C170,90 160,82 148,82 C136,82 132,92 132,110 L132,175 L185,175 Z")} />}
                    {isHighlighted('right-middle') && <path {...hl("M132,175 L123,82 C123,62 113,54 101,54 C89,54 85,64 85,82 L85,175 L132,175 Z")} />}
                    {isHighlighted('right-index') && <path {...hl("M85,175 L77,100 C77,80 67,72 55,72 C43,72 40,84 40,100 L40,185 L85,185 Z")} />}
                    {isHighlighted('right-thumb') && <path {...hl("M40,185 Q22,183 12,198 Q0,215 16,245 L32,255 L40,240 Z")} />}
                </svg>
            </div>
        </div>
    );
}
