import { useTranslation } from 'react-i18next';
import { useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface UseLanguageReturn {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const useLanguage = (): UseLanguageReturn => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<Language>(localStorage.getItem('i18nextLng') as Language || 'en');

  useEffect(() => {
    setLanguage((i18n.language as Language) || 'en');
  }, [i18n.language]);

  const changeLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  }, [i18n]);

  return { language, changeLanguage, t };
};

export default useLanguage;
