"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuthInit = () => {
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        login(user, token);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [login]);

  return loading;
};
