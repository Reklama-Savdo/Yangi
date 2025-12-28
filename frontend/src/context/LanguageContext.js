import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('reklama_language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('reklama_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
