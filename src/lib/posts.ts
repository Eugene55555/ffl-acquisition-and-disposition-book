import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { locales, type Locale } from '@/src/i18n/settings';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export type PostMeta = {
  slug: string;
  locale: Locale;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  cover?: string;
  author?: string;
  draft?: boolean;
};

export type Post = PostMeta & { content: string };

function safeReadDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

// Имя файла: <slug>.<locale>.md  например  hello-world.en.md
export function parseFilename(filename: string): { slug: string; locale: Locale } | null {
  const m = filename.match(/^(.+)\.(en|ru)\.md$/);
  if (!m) return null;
  return { slug: m[1], locale: m[2] as Locale };
}

export function getAllPosts(locale?: Locale): PostMeta[] {
  const files = safeReadDir(POSTS_DIR);
  const posts: PostMeta[] = [];
  for (const f of files) {
    const parsed = parseFilename(f);
    if (!parsed) continue;
    if (locale && parsed.locale !== locale) continue;
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const { data } = matter(raw);
    if (data.draft) continue;
    posts.push({
      slug: parsed.slug,
      locale: parsed.locale,
      title: data.title || parsed.slug,
      date: data.date ? String(data.date).slice(0, 10) : '1970-01-01',
      description: data.description,
      tags: data.tags || [],
      cover: data.cover,
      author: data.author,
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string, locale: Locale): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.${locale}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  if (data.draft) return null;
  return {
    slug,
    locale,
    title: data.title || slug,
    date: data.date ? String(data.date).slice(0, 10) : '1970-01-01',
    description: data.description,
    tags: data.tags || [],
    cover: data.cover,
    author: data.author,
    content,
  };
}

export function getSlugs(locale: Locale): string[] {
  return getAllPosts(locale).map((p) => p.slug);
}

export { POSTS_DIR };
