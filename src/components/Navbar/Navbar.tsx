import React, { useState } from 'react';
import { cn } from '../../utils/classNames';
import { NavbarProps, NavbarItem } from './types';
import './Navbar.css';

// Helper function for creating image icons
export const createIcon = (src: string, alt: string, size: number = 24): React.ReactElement => {
  return React.createElement('img', {
    src: src,
    alt: alt,
    style: { width: `${size}px`, height: `${size}px` }
  });
};

export const Navbar: React.FC<NavbarProps> = ({
  icon,
  logoText,
  logoHref = '/',
  items,
  position = 'top',
  style = 'default',
  alignment = 'right',
  font,
  fontColor,
  backgroundColor,
  className,
  itemClassName,
  iconClassName,
  onItemClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Handle item click
  const handleItemClick = (item: NavbarItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // If item has dropdown, toggle it
    if (item.dropdown) {
      event.preventDefault();
      return;
    }

    // Call custom onClick if provided
    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    }

    // Call parent callback
    onItemClick?.(item);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Handle icon error - fallback to default
  const handleIconError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/src/assets/shmoobium.webp';
  };

  // Render icon with logo text
  const renderIcon = () => {
    let iconElement;
    
    if (icon?.component) {
      iconElement = icon.component;
    } else if (icon?.src) {
      iconElement = (
        <img 
          src={icon.src} 
          alt={icon.alt || 'Logo'} 
          onError={handleIconError}
        />
      );
    } else {
      iconElement = <img src="/src/assets/shmoobium.webp" alt="Shmoobium" />;
    }

    const logoContent = (
      <>
        {iconElement}
        {logoText && <span className="navbar__logo-text">{logoText}</span>}
      </>
    );

    // If icon has onClick, use button
    if (icon?.onClick) {
      return (
        <button
          className={cn('navbar__icon-button', iconClassName)}
          onClick={icon.onClick}
          type="button"
        >
          {logoContent}
        </button>
      );
    }

    // If logoHref or icon.href, use link
    const href = icon?.href || logoHref;
    if (href) {
      return (
        <a
          href={href}
          className={cn('navbar__icon-link', iconClassName)}
        >
          {logoContent}
        </a>
      );
    }

    // Default div
    return (
      <div className={cn('navbar__icon', iconClassName)}>
        {logoContent}
      </div>
    );
  };

  // Render dropdown menu
  const renderDropdown = (items: NavbarItem[], parentIndex: number) => {
    if (openDropdown !== parentIndex) return null;

    return (
      <div className="navbar__dropdown">
        {items.map((item, index) => {
          const ItemComponent = item.href ? 'a' : 'button';
          const itemProps = item.href 
            ? { href: item.href }
            : { type: 'button' as const };

          return (
            <ItemComponent
              key={index}
              className={cn(
                'navbar__dropdown-item',
                item.disabled && 'navbar__dropdown-item--disabled'
              )}
              onClick={(e) => {
                handleItemClick(item, e);
                setOpenDropdown(null); // Close dropdown after click
              }}
              {...itemProps}
            >
              {item.icon && <span className="navbar__item-icon">{item.icon}</span>}
              <span className="navbar__item-label">{item.label}</span>
            </ItemComponent>
          );
        })}
      </div>
    );
  };

  // Get effective alignment based on position
  const getEffectiveAlignment = () => {
    if (position === 'left' || position === 'right') {
      // For vertical navbars: top/left = top, bottom/right = bottom
      if (alignment === 'top' || alignment === 'left') return 'top';
      if (alignment === 'bottom' || alignment === 'right') return 'bottom';
      return 'top'; // default
    } else {
      // For horizontal navbars: top/left = left, bottom/right = right
      if (alignment === 'top' || alignment === 'left') return 'left';
      if (alignment === 'bottom' || alignment === 'right') return 'right';
      return 'right'; // default
    }
  };

  // Render navigation items
  const renderItems = () => {
    const effectiveAlignment = getEffectiveAlignment();
    
    return (
      <div className={cn('navbar__items', `navbar__items--${effectiveAlignment}`)}>
        {items.map((item, index) => {
          const hasDropdown = item.dropdown && item.dropdown.length > 0;
          
          if (hasDropdown) {
            return (
              <div key={index} className="navbar__dropdown-container">
                <button
                  className={cn(
                    'navbar__item',
                    'navbar__item--dropdown',
                    item.disabled && 'navbar__item--disabled',
                    openDropdown === index && 'navbar__item--active',
                    itemClassName
                  )}
                  onClick={(e) => handleDropdownToggle(index, e)}
                  type="button"
                >
                  {item.icon && <span className="navbar__item-icon">{item.icon}</span>}
                  <span className="navbar__item-label">{item.label}</span>
                  <span className="navbar__dropdown-arrow">▼</span>
                </button>
                {renderDropdown(item.dropdown!, index)}
              </div>
            );
          }

          const ItemComponent = item.href ? 'a' : 'button';
          const itemProps = item.href 
            ? { href: item.href }
            : { type: 'button' as const };

          return (
            <ItemComponent
              key={index}
              className={cn(
                'navbar__item',
                item.disabled && 'navbar__item--disabled',
                itemClassName
              )}
              onClick={(e) => handleItemClick(item, e)}
              {...itemProps}
            >
              {item.icon && <span className="navbar__item-icon">{item.icon}</span>}
              <span className="navbar__item-label">{item.label}</span>
            </ItemComponent>
          );
        })}
      </div>
    );
  };

  // Custom styles
  const customStyles: React.CSSProperties = {
    ...(font && { fontFamily: font }),
    ...(fontColor && { color: fontColor }),
    ...(backgroundColor && { backgroundColor }),
  };

  return (
    <nav 
      className={cn(
        'navbar',
        `navbar--${position}`,
        `navbar--${style}`,
        className
      )}
      style={customStyles}
    >
      <div className="navbar__container">
        {renderIcon()}
        {renderItems()}
      </div>
    </nav>
  );
}; 