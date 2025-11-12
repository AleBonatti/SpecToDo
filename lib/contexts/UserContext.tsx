'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isCurrentUserAdmin } from '@/lib/auth/client';

interface UserContextType {
  isAdmin: boolean | null;
  isLoading: boolean;
  refreshUserRole: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CACHE_KEY = 'user_is_admin';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedAdminStatus(): { value: boolean; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function setCachedAdminStatus(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ value, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage errors
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  // Try to load from cache immediately to prevent flicker
  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    const cached = getCachedAdminStatus();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.value;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    const cached = getCachedAdminStatus();
    return !(cached && Date.now() - cached.timestamp < CACHE_DURATION);
  });

  const refreshUserRole = async () => {
    try {
      setIsLoading(true);
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      setCachedAdminStatus(adminStatus);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setIsAdmin(false);
      setCachedAdminStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCachedAdminStatus();
    // Only fetch if cache is missing or expired
    if (!cached || Date.now() - cached.timestamp >= CACHE_DURATION) {
      refreshUserRole();
    }
  }, []);

  return (
    <UserContext.Provider value={{ isAdmin, isLoading, refreshUserRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
