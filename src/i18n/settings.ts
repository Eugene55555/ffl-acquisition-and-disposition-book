// === НАСТРОЙКА ЯЗЫКОВ ===
// Хочешь оставить ОДИН язык — удали ненужный из массива locales.
// Например, только русский:  export const locales = ['ru'] as const
// Только английский:        export const locales = ['en'] as const
export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];

// Язык по умолчанию (если пользователь зашёл без /en или /ru)
export const defaultLocale: Locale = 'en';

// Человекочитаемые названия для переключателя в шапке
export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};
