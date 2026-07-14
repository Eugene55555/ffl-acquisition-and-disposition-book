import { redirect } from 'next/navigation';
import { defaultLocale } from '@/src/i18n/settings';

export default function RootIndex() {
  redirect(`/${defaultLocale}/`);
}
