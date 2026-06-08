import { Noto_Sans, Roboto } from 'next/font/google';

/* Primary font is used as local font */
export const primaryFont = Noto_Sans({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-primary',
});

/* Secondary font is used as local font */
export const SecondaryFont = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-secondary',
});
