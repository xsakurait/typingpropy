"use client";

/**
 * AuthContext.tsx
 *
 *
 * 【JWTが発行されるフロー】
 *  1. LoginForm で signIn(email, password) を呼ぶ
 *  2. amazon-cognito-identity-js が Cognito (AWS) へ SRP 認証を送信
 *  3. 認証成功 → Cognito が JWT (ID Token) を返す      ← ここで発行
 *  4. onSuccess コールバックで idToken を Cookie に保存
 *  5. 以降の fetch では Cookie から idToken を取り出して
 *     "Authorization: Bearer <JWT>" ヘッダーで Lambda に送信
 *  6. Lambda 側で JWT の署名・有効期限・発行者を検証 → OKならデータを返す
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';

/* ---------- 型定義 ---------- */
interface AuthContextType {
  user: CognitoUser | null;
  session: CognitoUserSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Cognito User Pool 設定 ---------- */
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
  ClientId:   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID   || "",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<CognitoUser | null>(null);
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const userPool = new CognitoUserPool(poolData);

  /* ---------- ページリロード時: LocalStorage のセッションを復元 ---------- */
  useEffect(() => {
    const currentUser = userPool.getCurrentUser(); // LocalStorage に保存された最後のユーザーを取得
    if (!currentUser) {
      setLoading(false);
      return;
    }

    currentUser.getSession((err: any, restored: CognitoUserSession | null) => {
      if (err || !restored?.isValid()) {
        // セッション期限切れ or エラー → 未ログイン扱い
        setLoading(false);
        return;
      }

      // セッション有効 → JWT を Cookie に再保存してログイン済み状態を復元
      const jwt = restored.getIdToken().getJwtToken(); // ← 復元した JWT
      Cookies.set('idToken', jwt, { secure: true, sameSite: 'strict' });
      setUser(currentUser);
      setSession(restored);
      setLoading(false);
    });
  }, []);

  /* ---------- サインイン: Cognito に認証 → JWT を受け取って保存 ---------- */
  const signIn = (email: string, password: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const cognitoUser  = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails  = new AuthenticationDetails({ Username: email, Password: password });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result: CognitoUserSession) => {
          const jwt = result.getIdToken().getJwtToken(); // ← JWT 取得
          Cookies.set('idToken', jwt, { secure: true, sameSite: 'strict' }); // Cookie に保存
          setUser(cognitoUser);
          setSession(result);
          resolve();
        },

        // 認証失敗: パスワード間違い等
        onFailure: (err) => reject(err),
      });
    });

  /* ---------- サインアウト ---------- */
  const signOut = () => {
    userPool.getCurrentUser()?.signOut();
    Cookies.remove('idToken'); // Cookie から JWT を削除
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- カスタムフック ---------- */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
