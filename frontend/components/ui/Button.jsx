import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary-500 text-background hover:bg-primary-400 hover:shadow-gold',
  secondary: 'bg-surface-200 text-text hover:bg-surface-300',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-background',
  ghost: 'text-text hover:bg-surface-200',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'active:translate-y-0 active:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
