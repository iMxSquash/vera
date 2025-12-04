import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'font-medium rounded-md transition-colors duration-200 cursor-pointer inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        primary: 'bg-gray-900 text-neutrals-50 hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
        outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
