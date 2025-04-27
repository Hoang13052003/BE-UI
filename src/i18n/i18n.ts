import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import tài nguyên ngôn ngữ
import translationEN from './locales/en/translation.json';
import translationCH from './locales/ch/translation.json';

// Tài nguyên ngôn ngữ
const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationCH
  }
};

i18n
  // Phát hiện ngôn ngữ
  .use(LanguageDetector)
  // Tích hợp với React
  .use(initReactI18next)
  // Khởi tạo i18next
  .init({
    resources,
    // lng: 'en', // Ngôn ngữ mặc định
    fallbackLng: 'en', // Ngôn ngữ dự phòng nếu không có bản dịch
    interpolation: {
      escapeValue: false // Không cần escape vì React đã xử lý XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
