import { en } from './en';
import { hi } from './hi';
import { od } from './od';

export const locales = {
  en,
  hi,
  od,
};

export type LocaleType = 'en' | 'hi' | 'od';
export type LocaleKeys = typeof en;
