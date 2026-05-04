"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGS = ['en', 'es', 'fr', 'pt'];

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  pt: { translation: pt },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'pt'],
    interpolation: {
      escapeValue: false,
    },
  });

export const getLanguageLabel = (code: string): string => {
  const labels: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    pt: 'Português',
  };
  return labels[code] || code;
};

export const getLanguageFlag = (code: string): string => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    fr: '🇫🇷',
    pt: '🇵🇹',
  };
  return flags[code] || '🌐';
};

export default i18n;
export * from 'react-i18next';
