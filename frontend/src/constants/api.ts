const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// すべての空白文字を完全に除去する
const cleanBase = rawBase.replace(/\s+/g, '');

// 末尾のスラッシュを一つだけに制御する
export const API_BASE_URL = cleanBase.endsWith('/') ? cleanBase : `${cleanBase}/`;
