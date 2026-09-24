import { type Locale } from '@/src/i18n/settings';

// Словарь интерфейса (en/ru). Ключ -> текст.
type Dict = Record<string, string>;

const en: Dict = {
  // Навигация
  'nav.books': 'Books',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.buy': 'Shop',
  'nav.reviews': 'Reviews',
  'nav.contact': 'Contact',
  'nav.login': 'Sign in',
  'nav.allBooks': 'All books',

  // Бренд
  'brand.name': 'Silas Thorne',
  'brand.tagline': 'ATF-compliant record books for FFL holders',

  // Главная
  'home.eyebrow': 'ATF-compliant record books',
  'home.title': 'The bound book the ATF asks for — already laid out.',
  'home.titleAccent': 'already laid out.',
  'home.lede':
    'Pre-formatted acquisition and disposition ledgers for FFL dealers, gunsmiths and manufacturers. Every required field in its place, on a proper bound record — no software, no subscription.',
  'home.ctaPrimary': 'Shop the collection',
  'home.ctaSecondary': 'Why a bound book',
  'home.tagline': 'Inspector-ready A&D ledgers for FFL holders.',
  'home.stat1': 'formats',
  'home.stat2': 'pre-formatted entries',
  'home.stat3': 'subscription',
  'home.stat4': 'record layout',
  'home.collection': 'The collection',
  'home.collectionLede': 'Three books, six editions. Pick the size and the binding that fit your counter.',
  'home.why': 'Why dealers keep a bound book',
  'home.whyLede': 'Regulations call for a bound record — not a stack of printable sheets and not a repurposed notebook.',
  'home.why1Title': 'Unannounced inspections',
  'home.why1Body': 'ATF compliance inspections can happen without warning. "I will organize it later" is not a plan.',
  'home.why2Title': 'Loose-leaf gets rejected',
  'home.why2Body': 'The requirement is a bound record, not a ring binder of loose pages. A proper bound book removes the doubt.',
  'home.why3Title': 'Every field, in its place',
  'home.why3Body': 'Date, name, address, serial — each in a dedicated column, arranged the way records are expected to read.',
  'home.why4Title': 'No subscription',
  'home.why4Body': 'A low-cost physical log. No software, no monthly fee, no login to forget.',
  'home.regTitle': 'What the regulation actually says',
  'home.regBody':
    'Each licensee shall record the receipt and disposition of each firearm in a bound record, with the date of receipt, the name and address of the person, the firearm\u2019s serial number, and the disposition information.',
  'home.regSource': '27 CFR § 478.125',
  'home.faqTitle': 'Frequently asked',
  'home.faq1q': 'Do FFL holders have to keep acquisition and disposition records?',
  'home.faq1a':
    'Yes. Federal law requires licensed firearms dealers to maintain acquisition and disposition records under 27 CFR § 478.125.',
  'home.faq2q': 'Is any log book "ATF approved"?',
  'home.faq2a':
    'No log book is individually approved by ATF. These books are formatted to match the record layout inspectors look for under 27 CFR § 478.125. A compliance tool, not legal advice.',
  'home.faq3q': 'What does 27 CFR § 478.125 require?',
  'home.faq3a':
    'For each firearm acquired and disposed of: the date, the name and address of the person, and the firearm and serial details — recorded in a bound format.',
  'home.faq4q': 'Paperback or hardcover?',
  'home.faq4a':
    'Paperback is the everyday write-in log for the counter. Hardcover is the durable, archival option. Many dealers keep a hardcover master and a paperback working copy.',
  'home.ctaTitle': 'Ready for the inspection you hope never comes.',
  'home.ctaBody': 'Pick your edition on Amazon — paperback for the counter, hardcover for the permanent file.',
  'home.latest': 'From the blog',

  // Лендинг книги
  'book.inStock': 'In stock',
  'book.buyOnAmazon': 'Buy on Amazon',
  'book.chooseEdition': 'Choose your edition',
  'book.inside': 'What is inside',
  'book.specs': 'Specifications',
  'book.pages': 'Pages',
  'book.entries': 'Record entries',
  'book.trim': 'Trim size',
  'book.regulation': 'Format',
  'book.binding': 'Binding',
  'book.related': 'Other books in the collection',
  'book.commentsTitle': 'Questions & comments',
  'book.commentsNote': 'Ask about the layout or share how you use it. Comments are moderated.',
  'book.allBooks': '← All books',

  // Магазин
  'buy.title': 'Shop',
  'buy.subtitle': 'Three books, six editions — paperback and hardcover. Ships from Amazon.',
  'buy.cta': 'Buy on Amazon',
  'buy.from': 'from',

  // Отзывы
  'reviews.title': 'Reviews & questions',
  'reviews.subtitle': 'Read what buyers say, or leave your own note about the layout.',
  'reviews.commentsTitle': 'Leave a comment',
  'reviews.commentsNote':
    'Comments are moderated and appear in the language you write in. Please keep it about the books.',
  'reviews.amazonNote': 'Verified purchase reviews live on each Amazon product page.',

  // Вход
  'login.title': 'Owner sign-in',
  'login.subtitle': 'A convenience panel for the site owner — not a security boundary.',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.wrong': 'Wrong password.',
  'login.logout': 'Sign out',
  'login.panelTitle': 'Owner panel',
  'login.panelNote': 'Quick links. Nothing here is secret — do not put customer data on this page.',
  'login.linkRepo': 'Repository',
  'login.linkActions': 'Deploy runs',
  'login.linkComments': 'Moderate comments',
  'login.linkKdp': 'KDP dashboard',
  'login.linkCatalog': 'Edit the catalog',

  // Общее
  'about.title': 'About',
  'contact.title': 'Get in touch',
  'contact.subtitle': 'Drop us a message and we will reply soon.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.send': 'Send message',
  'footer.rights': 'All rights reserved.',
  'footer.contact': 'Contact',
  'footer.legal': 'Legal',
  'footer.disclaimer':
    'No log book is individually approved by ATF. These books are formatted to the record layout inspectors look for under 27 CFR § 478.125. A compliance tool, not legal advice — verify current text at eCFR.gov.',
  'footer.made': 'Static site. No trackers, no cookies.',
  'lang.switch': 'Language',
  'post.by': 'By',
  'post.published': 'Published',
  'post.back': '← Back to blog',
  'post.share': 'Share',

  // SEO
  'seo.home.title': 'ATF-Compliant FFL Bound Book — Acquisition & Disposition Logs',
  'seo.home.desc':
    'Pre-formatted, ATF-compliant FFL acquisition and disposition log books for dealers, gunsmiths and manufacturers. Paperback and hardcover, built to 27 CFR § 478.125.',
  'seo.blog.title': 'Blog',
  'seo.blog.desc': 'Notes on FFL record-keeping, A&D logs and compliance.',
  'seo.buy.title': 'Shop — FFL A&D bound books',
  'seo.buy.desc': 'All editions: 120-page, 200-page and landscape FFL acquisition & disposition log books.',
  'seo.reviews.title': 'Reviews & questions',
  'seo.reviews.desc': 'Reader questions and comments about the FFL acquisition & disposition log books.',
  'seo.about.title': 'About',
  'seo.about.desc': 'Who makes these record books and why they are laid out this way.',
  'seo.contact.title': 'Get in touch',
  'seo.contact.desc': 'Questions about the books, wholesale or bulk orders.',
  'seo.login.title': 'Owner sign-in',
  'seo.login.desc': 'Owner convenience panel.',
};

const ru: Dict = {
  'nav.books': 'Книги',
  'nav.blog': 'Блог',
  'nav.about': 'О нас',
  'nav.buy': 'Магазин',
  'nav.reviews': 'Отзывы',
  'nav.contact': 'Связаться',
  'nav.login': 'Вход',
  'nav.allBooks': 'Все книги',

  'brand.name': 'Silas Thorne',
  'brand.tagline': 'Журналы для FFL по требованиям ATF',

  'home.eyebrow': 'Журналы по требованиям ATF',
  'home.title': 'Тот самый «bound book», который спрашивает ATF — уже свёрстан.',
  'home.titleAccent': 'уже свёрстан.',
  'home.lede':
    'Готовые журналы учёта приобретения и отчуждения оружия для FFL-дилеров, оружейников и производителей. Каждый обязательный реквизит на своём месте, на настоящем сброшюрованном бланке — без софта и подписок.',
  'home.ctaPrimary': 'Смотреть коллекцию',
  'home.ctaSecondary': 'Зачем «bound book»',
  'home.tagline': 'Готовые A&D-журналы для держателей FFL.',
  'home.stat1': 'форматов',
  'home.stat2': 'готовых строк',
  'home.stat3': 'подписка',
  'home.stat4': 'раскладка записей',
  'home.collection': 'Коллекция',
  'home.collectionLede': 'Три книги, шесть изданий. Выберите размер и переплёт под свой прилавок.',
  'home.why': 'Почему дилеры держат «bound book»',
  'home.whyLede': 'Требование — сброшюрованный журнал, а не стопка распечатанных листов и не переделанный блокнот.',
  'home.why1Title': 'Проверки без предупреждения',
  'home.why1Body': 'Проверка ATF может прийти без предупреждения. «Разберусь потом» — это не план.',
  'home.why2Title': 'Сменные листы не подходят',
  'home.why2Body': 'Требуется сброшюрованный учёт, а не папка с отдельными страницами. Настоящий bound book снимает вопрос.',
  'home.why3Title': 'Каждый реквизит на своём месте',
  'home.why3Body': 'Дата, имя, адрес, серийный номер — каждый в своей колонке, в том порядке, в котором записи принято читать.',
  'home.why4Title': 'Без подписки',
  'home.why4Body': 'Недорогой бумажный журнал. Ни софта, ни месячной платы, ни забытого пароля.',
  'home.regTitle': 'Что на самом деле говорит регламент',
  'home.regBody':
    'Каждый лицензиат обязан фиксировать получение и отчуждение каждого оружия в сброшюрованном учёте: дату получения, имя и адрес лица, серийный номер оружия и сведения об отчуждении.',
  'home.regSource': '27 CFR § 478.125',
  'home.faqTitle': 'Частые вопросы',
  'home.faq1q': 'Обязаны ли держатели FFL вести учёт приобретения и отчуждения?',
  'home.faq1a':
    'Да. Федеральный закон требует от лицензированных дилеров вести учёт приобретения и отчуждения оружия по 27 CFR § 478.125.',
  'home.faq2q': 'Есть ли журналы, «одобренные ATF»?',
  'home.faq2a':
    'Ни один подобный журнал не одобряется ATF поштучно. Эти книги свёрстаны по той раскладке записей, которую проверяют инспекторы в рамках 27 CFR § 478.125. Это инструмент соответствия, а не юридическая консультация.',
  'home.faq3q': 'Что требует 27 CFR § 478.125?',
  'home.faq3a':
    'По каждому приобретённому и отчуждённому оружию: дата, имя и адрес лица, а также данные об оружии и серийном номере — в сброшюрованном виде.',
  'home.faq4q': 'Бумажная или твёрдый переплёт?',
  'home.faq4a':
    'Бумажная — рабочий журнал на прилавок. Твёрдый переплёт — долговечный архивный вариант. Многие держат твёрдый как мастер-журнал, а бумажный как рабочий.',
  'home.ctaTitle': 'Готовы к проверке, которую не хотите дождаться.',
  'home.ctaBody': 'Выберите издание на Amazon — бумажное на прилавок, твёрдый переплёт в постоянный архив.',
  'home.latest': 'Из блога',

  'book.inStock': 'В наличии',
  'book.buyOnAmazon': 'Купить на Amazon',
  'book.chooseEdition': 'Выберите издание',
  'book.inside': 'Что внутри',
  'book.specs': 'Характеристики',
  'book.pages': 'Страниц',
  'book.entries': 'Строк для записей',
  'book.trim': 'Формат',
  'book.regulation': 'Раскладка',
  'book.binding': 'Переплёт',
  'book.related': 'Другие книги коллекции',
  'book.commentsTitle': 'Вопросы и комментарии',
  'book.commentsNote': 'Спросите про раскладку или расскажите, как пользуетесь. Комментарии модерируются.',
  'book.allBooks': '← Все книги',

  'buy.title': 'Магазин',
  'buy.subtitle': 'Три книги, шесть изданий — бумажная и твёрдый переплёт. Отправка с Amazon.',
  'buy.cta': 'Купить на Amazon',
  'buy.from': 'от',

  'reviews.title': 'Отзывы и вопросы',
  'reviews.subtitle': 'Прочитайте, что пишут покупатели, или оставьте свою заметку о раскладке.',
  'reviews.commentsTitle': 'Оставить комментарий',
  'reviews.commentsNote':
    'Комментарии модерируются и появляются на том языке, на котором вы пишете. Пожалуйста, только о книгах.',
  'reviews.amazonNote': 'Отзывы подтверждённых покупателей — на странице каждой книги на Amazon.',

  'login.title': 'Вход владельца',
  'login.subtitle': 'Панель удобства для владельца сайта — не средство защиты.',
  'login.password': 'Пароль',
  'login.submit': 'Войти',
  'login.wrong': 'Неверный пароль.',
  'login.logout': 'Выйти',
  'login.panelTitle': 'Панель владельца',
  'login.panelNote': 'Быстрые ссылки. Секретов здесь нет — не размещайте данные клиентов на этой странице.',
  'login.linkRepo': 'Репозиторий',
  'login.linkActions': 'Сборки деплоя',
  'login.linkComments': 'Модерация комментариев',
  'login.linkKdp': 'Кабинет KDP',
  'login.linkCatalog': 'Правка каталога',

  'about.title': 'О нас',
  'contact.title': 'Свяжитесь с нами',
  'contact.subtitle': 'Напишите нам — ответим в ближайшее время.',
  'contact.name': 'Имя',
  'contact.email': 'Email',
  'contact.message': 'Сообщение',
  'contact.send': 'Отправить',
  'footer.rights': 'Все права защищены.',
  'footer.contact': 'Связь',
  'footer.legal': 'Правовая информация',
  'footer.disclaimer':
    'Ни один подобный журнал не одобряется ATF поштучно. Эти книги свёрстаны по раскладке записей, которую проверяют инспекторы в рамках 27 CFR § 478.125. Это инструмент соответствия, а не юридическая консультация — проверяйте актуальный текст на eCFR.gov.',
  'footer.made': 'Статический сайт. Без трекеров и cookie.',
  'lang.switch': 'Язык',
  'post.by': 'Автор',
  'post.published': 'Опубликовано',
  'post.back': '← Назад в блог',
  'post.share': 'Поделиться',

  'seo.home.title': 'Журнал FFL по требованиям ATF — учёт приобретения и отчуждения',
  'seo.home.desc':
    'Готовые журналы учёта приобретения и отчуждения оружия для FFL-дилеров, оружейников и производителей. Бумажная и твёрдый переплёт, по 27 CFR § 478.125.',
  'seo.blog.title': 'Блог',
  'seo.blog.desc': 'Заметки об учёте FFL, A&D-журналах и соответствии требованиям.',
  'seo.buy.title': 'Магазин — журналы FFL A&D',
  'seo.buy.desc': 'Все издания: 120 страниц, 200 страниц и альбомный журнал учёта FFL.',
  'seo.reviews.title': 'Отзывы и вопросы',
  'seo.reviews.desc': 'Вопросы и комментарии читателей о журналах учёта FFL.',
  'seo.about.title': 'О нас',
  'seo.about.desc': 'Кто делает эти журналы и почему они свёрстаны именно так.',
  'seo.contact.title': 'Связаться',
  'seo.contact.desc': 'Вопросы о книгах, оптовые и корпоративные заказы.',
  'seo.login.title': 'Вход владельца',
  'seo.login.desc': 'Панель удобства владельца сайта.',
};

const dicts: Record<Locale, Dict> = { en };

export function t(locale: Locale, key: string): string {
  return dicts[locale]?.[key] ?? dicts.en[key] ?? key;
}
