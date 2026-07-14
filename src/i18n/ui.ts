import { type Locale } from '@/src/i18n/settings';

// Простой словарь интерфейса. Добавляй ключи по мере роста.
type Dict = Record<string, string>;

const en: Dict = {
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.buy': 'Buy',
  'nav.contact': 'Contact',
  'home.tagline': 'Notes, guides and products — built fast and clean.',
  'home.readmore': 'Read more',
  'home.latest': 'Latest posts',
  'post.by': 'By',
  'post.published': 'Published',
  'post.back': '← Back to blog',
  'buy.title': 'Get the product',
  'buy.subtitle': 'Payment buttons will be wired up here. Placeholder for now.',
  'buy.cta': 'Buy now',
  'about.title': 'About us',
  'contact.title': 'Get in touch',
  'contact.subtitle': 'Drop us a message and we will reply soon.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'footer.rights': 'All rights reserved.',
  'lang.switch': 'Language',
};

const ru: Dict = {
  'nav.blog': 'Блог',
  'nav.about': 'О нас',
  'nav.buy': 'Купить',
  'nav.contact': 'Связаться',
  'home.tagline': 'Заметки, гайды и продукты — быстро и чисто.',
  'home.readmore': 'Читать далее',
  'home.latest': 'Свежие записи',
  'post.by': 'Автор',
  'post.published': 'Опубликовано',
  'post.back': '← Назад в блог',
  'buy.title': 'Купить продукт',
  'buy.subtitle': 'Здесь появятся кнопки оплаты. Пока заглушка.',
  'buy.cta': 'Купить',
  'about.title': 'О нас',
  'contact.title': 'Свяжитесь с нами',
  'contact.subtitle': 'Напишите нам — ответим в ближайшее время.',
  'contact.name': 'Имя',
  'contact.email': 'Email',
  'contact.message': 'Сообщение',
  'contact.send': 'Отправить',
  'footer.rights': 'Все права защищены.',
  'lang.switch': 'Язык',
};

const dicts: Record<Locale, Dict> = { en, ru };

export function t(locale: Locale, key: string): string {
  return dicts[locale]?.[key] ?? dicts.en[key] ?? key;
}
