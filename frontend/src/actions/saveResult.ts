'use server';

import { API_BASE_URL } from '../constants/api';

export async function saveResult(wpm: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wpm }),
    });
    
    if (!res.ok) {
        throw new Error("Failed to save result");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
