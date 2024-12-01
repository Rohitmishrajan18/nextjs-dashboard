import { Inter } from 'next/font/google';
import { Lusitana } from 'next/font/google';

// Define Lusitana font with weights 400 (normal) and 700 (bold)
export const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'] });

// Define Inter font with default settings (only 'latin' subset)
export const inter = Inter({ subsets: ['latin'] });
