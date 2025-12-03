import { cva, type VariantProps } from 'class-variance-authority';

export const hyperlinkVariants = cva('font-medium transition-colors duration-200', {
  variants: {
    variant: {
      primary: 'text-gray-900 hover:text-gray-700 active:text-gray-950 underline',
      secondary: 'text-gray-600 hover:text-gray-900 active:text-gray-700',
      muted: 'text-gray-500 hover:text-gray-700 active:text-gray-600 hover:underline',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export type HyperlinkVariants = VariantProps<typeof hyperlinkVariants>;
