import { redirect } from 'next/navigation';
import { defaultLocale } from '@/src/i18n/settings';
import { BASE_PATH } from '@/src/lib/base';

export default function RootIndex() {
  redirect(`${BASE_PATH}/${defaultLocale}/`);
}
