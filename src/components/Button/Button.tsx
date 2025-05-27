import React from 'react';
import { cn } from '../../utils/classNames';
import { ButtonProps } from './types';
import './Button.css';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = '16' }) => (
  <svg
    className="button__spinner"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
    />
  </svg>
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = cn(
    'button',
    `button--${variant}`,
    `button--${size}`,
    `button--${shape}`,
    loading ? 'button--loading' : false,
    disabled ? 'button--disabled' : false,
    fullWidth ? 'button--full-width' : false,
    (leftIcon && !loading) ? 'button--has-left-icon' : false,
    (rightIcon && !loading) ? 'button--has-right-icon' : false,
    className
  );

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return '14';
      case 'md': return '16';
      case 'lg': return '18';
      case 'xl': return '20';
      default: return '16';
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="button__loading-wrapper">
          <LoadingSpinner size={getSpinnerSize()} />
        </span>
      )}
      
      {!loading && leftIcon && (
        <span className="button__left-icon">
          {leftIcon}
        </span>
      )}
      
      <span className={cn('button__content', loading && 'button__content--hidden')}>
        {children}
      </span>
      
      {!loading && rightIcon && (
        <span className="button__right-icon">
          {rightIcon}
        </span>
      )}
    </button>
  );
}; 