import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
}: ButtonProps) => {
  return (
    <button
      className={`
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        rounded-lg
        font-medium
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        flex
        items-center
        justify-center
        gap-2
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
      {children}
    </button>
  );
};
