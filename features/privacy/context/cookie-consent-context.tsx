"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  CookieConsentPreferences,
  DEFAULT_CONSENT_PREFERENCES,
} from "../types/cookie-consent.types";
import { getStoredConsent, setStoredConsent } from "../services/cookie-consent.service";

interface CookieConsentContextType {
  preferences: CookieConsentPreferences | null;
  hasDecided: boolean;
  isBannerOpen: boolean;
  isPreferencesModalOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  saveCustomPreferences: (prefs: { analytics: boolean; preferences: boolean }) => void;
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
  openBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookieConsentPreferences | null>(null);
  const [hasDecided, setHasDecided] = useState<boolean>(true); // default true to avoid flash on mount
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (existing) {
      setPreferences(existing);
      setHasDecided(true);
      setIsBannerOpen(false);
    } else {
      setPreferences(null);
      setHasDecided(false);
      // Small timeout to allow initial page hydrate gracefully before banner enters
      const timer = setTimeout(() => setIsBannerOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const updated = setStoredConsent({
      essential: true,
      analytics: true,
      preferences: true,
    });
    setPreferences(updated);
    setHasDecided(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
  }, []);

  const rejectOptional = useCallback(() => {
    const updated = setStoredConsent({
      essential: true,
      analytics: false,
      preferences: false,
    });
    setPreferences(updated);
    setHasDecided(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
  }, []);

  const saveCustomPreferences = useCallback((custom: { analytics: boolean; preferences: boolean }) => {
    const updated = setStoredConsent({
      essential: true,
      analytics: custom.analytics,
      preferences: custom.preferences,
    });
    setPreferences(updated);
    setHasDecided(true);
    setIsBannerOpen(false);
    setIsPreferencesModalOpen(false);
  }, []);

  const openPreferencesModal = useCallback(() => {
    setIsPreferencesModalOpen(true);
  }, []);

  const closePreferencesModal = useCallback(() => {
    setIsPreferencesModalOpen(false);
  }, []);

  const openBanner = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasDecided,
        isBannerOpen,
        isPreferencesModalOpen,
        acceptAll,
        rejectOptional,
        saveCustomPreferences,
        openPreferencesModal,
        closePreferencesModal,
        openBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return ctx;
}
