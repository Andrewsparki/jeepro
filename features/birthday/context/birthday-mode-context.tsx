"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { BirthdayService, UserBirthdayRecapData } from "../services/birthday.service";

interface BirthdayModeContextType {
  isBirthdayToday: boolean;
  isBirthdayModeActive: boolean;
  recapData: UserBirthdayRecapData | null;
  isLoadingRecap: boolean;
  isModalOpen: boolean;
  openRecapModal: () => void;
  closeRecapModal: () => void;
  refreshRecap: () => Promise<void>;
}

const BirthdayModeContext = createContext<BirthdayModeContextType | null>(null);

const BIRTHDAY_CHECK_SESSION_KEY = "jee_pro_birthday_checked_session";
const BIRTHDAY_MODE_ACTIVE_KEY = "jee_pro_birthday_mode_active";

export function BirthdayModeProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [isBirthdayModeActive, setIsBirthdayModeActive] = useState(false);
  const [recapData, setRecapData] = useState<UserBirthdayRecapData | null>(null);
  const [isLoadingRecap, setIsLoadingRecap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecap = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingRecap(true);
    try {
      const data = await BirthdayService.getUserYearRecap(user.id);
      setRecapData(data);
    } catch (e) {
      console.error("[BirthdayModeProvider] Error fetching recap:", e);
    } finally {
      setIsLoadingRecap(false);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      const resetTimer = setTimeout(() => {
        if (!cancelled) {
          setIsBirthdayToday(false);
          setIsBirthdayModeActive(false);
          setRecapData(null);
        }
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(resetTimer);
      };
    }

    // Process birthday status (prefer in-memory profile from AuthProvider to skip duplicate network roundtrip)
    const processBirthdayInfo = (info: { isBirthdayToday: boolean; canClaim: boolean }) => {
      if (cancelled) return;
      setIsBirthdayToday(info.isBirthdayToday);

      if (info.isBirthdayToday) {
        setIsBirthdayModeActive(true);
        try {
          localStorage.setItem(
            BIRTHDAY_MODE_ACTIVE_KEY,
            new Date().toISOString().split("T")[0]
          );
        } catch {
          // ignore localStorage error
        }
      }

      // Check if automatic first-session popup should fire
      const alreadyChecked = sessionStorage.getItem(BIRTHDAY_CHECK_SESSION_KEY);
      if (info.canClaim && !alreadyChecked) {
        sessionStorage.setItem(BIRTHDAY_CHECK_SESSION_KEY, "true");
        fetchRecap().then(() => {
          if (!cancelled) setIsModalOpen(true);
        });
      }
    };

    if (profile) {
      const birthdayStr = profile.birthday;
      const lastClaimedYear = profile.birthday_last_claimed_year;
      const currentYear = new Date().getFullYear();

      let isToday = false;
      if (birthdayStr) {
        const today = new Date();
        const bday = new Date(birthdayStr);
        isToday = today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
      }

      const canClaim = isToday && (lastClaimedYear === null || lastClaimedYear === undefined || lastClaimedYear < currentYear);
      processBirthdayInfo({ isBirthdayToday: isToday, canClaim });
    } else {
      // Fallback query if profile not yet hydrated
      BirthdayService.getBirthdayInfo(user.id).then(processBirthdayInfo);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile, fetchRecap]);

  // Listen for custom trigger events (e.g. from test codes or replay buttons)
  useEffect(() => {
    const handleTrigger = () => {
      fetchRecap().then(() => {
        setIsBirthdayToday(true);
        setIsBirthdayModeActive(true);
        setIsModalOpen(true);
      });
    };

    window.addEventListener("trigger-birthday-celebration", handleTrigger);
    return () => {
      window.removeEventListener("trigger-birthday-celebration", handleTrigger);
    };
  }, [fetchRecap]);

  const openRecapModal = useCallback(() => {
    fetchRecap().then(() => {
      setIsModalOpen(true);
    });
  }, [fetchRecap]);

  const closeRecapModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const refreshRecap = useCallback(async () => {
    await fetchRecap();
  }, [fetchRecap]);

  const contextValue = React.useMemo(
    () => ({
      isBirthdayToday,
      isBirthdayModeActive,
      recapData,
      isLoadingRecap,
      isModalOpen,
      openRecapModal,
      closeRecapModal,
      refreshRecap,
    }),
    [
      isBirthdayToday,
      isBirthdayModeActive,
      recapData,
      isLoadingRecap,
      isModalOpen,
      openRecapModal,
      closeRecapModal,
      refreshRecap,
    ]
  );

  return (
    <BirthdayModeContext.Provider value={contextValue}>
      {children}
    </BirthdayModeContext.Provider>
  );
}

export function useBirthdayMode() {
  const context = useContext(BirthdayModeContext);
  if (!context) {
    throw new Error("useBirthdayMode must be used within a BirthdayModeProvider");
  }
  return context;
}
