import { API_BASE_URL } from '../constants/api';
import { Lesson } from '../types/lesson';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
};

export const fetchLessons = async (): Promise<Lesson[]> => {
  try {
    const userPool = new CognitoUserPool(poolData);
    const currentUser = userPool.getCurrentUser();
    
    let token: string | undefined;

    if (currentUser) {
      const session = await new Promise<any>((resolve, reject) => {
        currentUser.getSession((err: any, session: any) => {
          if (err) reject(err);
          else resolve(session);
        });
      });
      token = session?.getIdToken()?.getJwtToken();
    }

    const res = await fetch(`${API_BASE_URL}/api/lessons`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    if (!res.ok) {
        if (res.status === 401) console.error("Unauthorized API call");
        return [];
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching lessons:", err);
    return [];
  }
};
