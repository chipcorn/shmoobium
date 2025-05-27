import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  slideover = 'default',
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
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Determine effective position (left/right become top on mobile)
    const effectivePosition = isMobile && (position === 'left' || position === 'right') ? 'top' : position;
    
    const bodyClassMap = {
      'top': style === 'floating' ? 'navbar-floating-top' : 'navbar-top',
      'bottom': style === 'floating' ? 'navbar-floating-bottom' : 'navbar-bottom',
      'left': style === 'floating' ? 'navbar-floating-left' : 'navbar-left',
      'right': style === 'floating' ? 'navbar-floating-right' : 'navbar-right',
    };

    const bodyClass = bodyClassMap[effectivePosition];
    document.body.classList.add(bodyClass);

    // Clean up other navbar classes
    Object.values(bodyClassMap).forEach(cls => {
      if (cls !== bodyClass) {
        document.body.classList.remove(cls);
      }
    });

    // Update current URL state to trigger re-renders
    setCurrentUrl(window.location.href);

    // Mobile detection
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setMobileMenuOpen(false);
        setMobileDropdownOpen(null);
      }
    };

    // Close mobile menu on outside click
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navbar__mobile-menu') && !target.closest('.navbar__mobile-toggle')) {
        setMobileMenuOpen(false);
        setMobileDropdownOpen(null);
      }
    };

    // Close mobile menu on scroll
    const handleScroll = () => {
      setMobileMenuOpen(false);
      setMobileDropdownOpen(null);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.body.classList.remove(bodyClass);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [position, style, isMobile]);

  // Helper function to check if a navigation item is active
  const isItemActive = (item: NavbarItem): boolean => {
    if (!item.href) return false;
    
    const currentPath = window.location.pathname;
    const currentPage = window.location.pathname.split('/').pop() || '';
    const currentHref = window.location.href;
    
    console.log('🔍 Checking active state for:', item.label);
    console.log('   Item href:', item.href);
    console.log('   Current page:', currentPage);
    console.log('   Current path:', currentPath);
    console.log('   Current href:', currentHref);
    
    // Simple filename match
    if (item.href === currentPage) {
      console.log('✅ ACTIVE MATCH found for:', item.label);
      return true;
    }
    
    // Handle index.html as home page
    if (item.href === 'index.html' && (currentPage === 'index.html' || currentPage === '')) {
      console.log('✅ ACTIVE MATCH (index) found for:', item.label);
      return true;
    }
    
    console.log('❌ No match for:', item.label);
    return false;
  };

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
                item.disabled && 'navbar__dropdown-item--disabled',
                isItemActive(item) && 'navbar__dropdown-item--current'
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
                isItemActive(item) && 'navbar__item--current',
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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setOpenDropdown(null); // Close any open dropdowns
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(null);
  };

  // Render mobile menu button
  const renderMobileToggle = () => {
    if (!isMobile) return null;

    return (
      <button
        className="navbar__mobile-toggle"
        onClick={toggleMobileMenu}
        type="button"
        aria-label="Toggle mobile menu"
      >
        <div className="navbar__hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    );
  };

  return (
    <>
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
        {renderMobileToggle()}
      </nav>
      
      <MobileMenuPortal
        isOpen={mobileMenuOpen && isMobile}
        onClose={closeMobileMenu}
        items={items}
        slideover={slideover}
        position={position}
        mobileDropdownOpen={mobileDropdownOpen}
        setMobileDropdownOpen={setMobileDropdownOpen}
        isItemActive={isItemActive}
      />
    </>
  );
};

// Separate Mobile Menu Portal Component
const MobileMenuPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: NavbarItem[];
  slideover: string;
  position: string;
  mobileDropdownOpen: number | null;
  setMobileDropdownOpen: (index: number | null) => void;
  isItemActive: (item: NavbarItem) => boolean;
}> = ({ isOpen, onClose, items, slideover, position, mobileDropdownOpen, setMobileDropdownOpen, isItemActive }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  // Handle animation states
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before triggering animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside to close menu
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const menuClass = slideover === 'bubble' ? 'navbar__mobile-menu--bubble' : 'navbar__mobile-menu--default';
  
  // For slideover menus, determine the correct side based on navbar position
  // Left navbars should open on the right since that's where the hamburger is
  let slideoverPosition = position;
  if (position === 'left') {
    slideoverPosition = 'right'; // Left navbar opens menu on right
  }
  
  const positionClass = `navbar__mobile-menu--${slideoverPosition}`;
  const visibleClass = isVisible ? 'navbar__mobile-menu--visible' : '';

  const menuContent = (
    <div ref={menuRef} className={cn('navbar__mobile-menu', menuClass, positionClass, visibleClass)}>
      <div className="navbar__mobile-items">
        {items.map((item, index) => {
          const hasDropdown = item.dropdown && item.dropdown.length > 0;
          
          if (hasDropdown) {
            const isDropdownOpen = mobileDropdownOpen === index;
            return (
              <div key={index}>
                <button
                  className={cn(
                    'navbar__mobile-item',
                    'navbar__mobile-item--dropdown',
                    isDropdownOpen && 'navbar__mobile-item--active'
                  )}
                  onClick={() => setMobileDropdownOpen(isDropdownOpen ? null : index)}
                  type="button"
                >
                  {item.icon && <span className="navbar__item-icon">{item.icon}</span>}
                  <span className="navbar__item-label">{item.label}</span>
                  <span className={cn('navbar__dropdown-arrow', isDropdownOpen && 'navbar__dropdown-arrow--open')}>▼</span>
                </button>
                {isDropdownOpen && (
                  <div className="navbar__mobile-dropdown">
                    {item.dropdown!.map((dropdownItem, dropdownIndex) => {
                      const DropdownComponent = dropdownItem.href ? 'a' : 'button';
                      const dropdownProps = dropdownItem.href 
                        ? { href: dropdownItem.href }
                        : { type: 'button' as const };

                      return (
                        <DropdownComponent
                          key={dropdownIndex}
                          className={cn(
                            'navbar__mobile-dropdown-item',
                            dropdownItem.disabled && 'navbar__mobile-dropdown-item--disabled',
                            isItemActive(dropdownItem) && 'navbar__mobile-dropdown-item--current'
                          )}
                          onClick={() => {
                            if (dropdownItem.onClick) dropdownItem.onClick();
                            onClose();
                            setMobileDropdownOpen(null);
                          }}
                          {...dropdownProps}
                        >
                          {dropdownItem.icon && <span className="navbar__item-icon">{dropdownItem.icon}</span>}
                          <span className="navbar__item-label">{dropdownItem.label}</span>
                        </DropdownComponent>
                      );
                    })}
                  </div>
                )}
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
                'navbar__mobile-item',
                item.disabled && 'navbar__mobile-item--disabled',
                isItemActive(item) && 'navbar__mobile-item--current'
              )}
              onClick={() => {
                if (item.onClick) item.onClick();
                onClose();
                setMobileDropdownOpen(null);
              }}
              {...itemProps}
            >
              {item.icon && <span className="navbar__item-icon">{item.icon}</span>}
              <span className="navbar__item-label">{item.label}</span>
            </ItemComponent>
          );
        })}
      </div>
    </div>
  );

  // Render to document.body to completely avoid navbar positioning
  return createPortal(menuContent, document.body);
}; 