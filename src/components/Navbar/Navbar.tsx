import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/classNames';
import { NavbarProps, NavbarItem } from './types';
import { VERSION } from '../../version';
import './Navbar.css';

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
  displayShmoobiumVersion = false,
  className,
  itemClassName,
  iconClassName,
  onItemClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const navbarRef = React.useRef<HTMLElement>(null);
  const itemsRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<HTMLDivElement>(null);

  const validPositions = ['top', 'bottom', 'left', 'right'];
  const safePosition = position && validPositions.indexOf(position) !== -1 ? position : 'top';

  const checkIfItemsFit = React.useCallback(() => {
    if (!navbarRef.current || !itemsRef.current || !iconRef.current) return true;
    if (safePosition === 'left' || safePosition === 'right') return true;
    
    const navbarWidth = navbarRef.current.offsetWidth;
    const iconWidth = iconRef.current.offsetWidth;
    
    let estimatedWidth = 0;
    
    items.forEach((item) => {
      const textLength = item.label.length;
      const hasIcon = !!item.icon;
      const hasDropdown = item.dropdown && item.dropdown.length > 0;
      
      let itemWidth = 40;
      itemWidth += textLength * 8;
      if (hasIcon) itemWidth += 32;
      if (hasDropdown) itemWidth += 20;
      
      estimatedWidth += itemWidth;
    });
    
    estimatedWidth += (items.length - 1) * 12;
    
    const availableSpace = navbarWidth - iconWidth - 70 + 50; // 40px padding + 30px mobile toggle space + 50px overflow allowance
    const itemsFit = estimatedWidth <= availableSpace;
    
    console.log('🔍 Navbar fit check:', {
      navbarWidth,
      iconWidth,
      estimatedWidth,
      availableSpace,
      itemsFit,
      currentMode: isMobile ? 'mobile' : 'desktop'
    });
    
    return itemsFit;
  }, [safePosition, items, isMobile]);

  useEffect(() => {
    const effectivePosition = isMobile && (safePosition === 'left' || safePosition === 'right') ? 'top' : safePosition;
    
    const bodyClassMap = {
      'top': style === 'floating' ? 'navbar-floating-top' : 'navbar-top',
      'bottom': style === 'floating' ? 'navbar-floating-bottom' : 'navbar-bottom',
      'left': style === 'floating' ? 'navbar-floating-left' : 'navbar-left',
      'right': style === 'floating' ? 'navbar-floating-right' : 'navbar-right',
    };

    const bodyClass = bodyClassMap[effectivePosition];
    document.body.classList.add(bodyClass);

    const bodyClassValues = [
      bodyClassMap.top,
      bodyClassMap.bottom,
      bodyClassMap.left,
      bodyClassMap.right
    ];
    
    bodyClassValues.forEach((cls: string) => {
      if (cls !== bodyClass) {
        document.body.classList.remove(cls);
      }
    });

    setCurrentUrl(window.location.href);

    const handleResize = () => {
      const itemsFit = checkIfItemsFit();
      const shouldBeMobile = !itemsFit;
      
      if (shouldBeMobile !== isMobile) {
        setIsMobile(shouldBeMobile);
        if (!shouldBeMobile) {
          setMobileMenuOpen(false);
          setMobileDropdownOpen(null);
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navbar__mobile-menu') && !target.closest('.navbar__mobile-toggle')) {
        setMobileMenuOpen(false);
        setMobileDropdownOpen(null);
      }
    };

    const handleScroll = () => {
      setMobileMenuOpen(false);
      setMobileDropdownOpen(null);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll);
  
    setTimeout(handleResize, 0);

    return () => {
      document.body.classList.remove(bodyClass);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [safePosition, style, checkIfItemsFit]);

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
    
    if (item.href === currentPage) {
      console.log('✅ ACTIVE MATCH found for:', item.label);
      return true;
    }
    
    if (item.href === 'index.html' && (currentPage === 'index.html' || currentPage === '')) {
      console.log('✅ ACTIVE MATCH (index) found for:', item.label);
      return true;
    }
    
    console.log('❌ No match for:', item.label);
    return false;
  };

  const handleItemClick = (item: NavbarItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.dropdown) {
      event.preventDefault();
      return;
    }

    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    }

    onItemClick?.(item);
  };

  const handleDropdownToggle = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleIconError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp';
  };

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
      iconElement = <img src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp" alt="Shmoobium" />;
    }

    const logoContent = (
      <>
        {iconElement}
        {logoText && <span className="navbar__logo-text">{logoText}</span>}
      </>
    );

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

    return (
      <div className={cn('navbar__icon', iconClassName)}>
        {logoContent}
      </div>
    );
  };

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
                setOpenDropdown(null);
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

  const getEffectiveAlignment = () => {
    if (safePosition === 'left' || safePosition === 'right') {
      if (alignment === 'top' || alignment === 'left') return 'top';
      if (alignment === 'bottom' || alignment === 'right') return 'bottom';
      return 'top';
    } else {
      if (alignment === 'top' || alignment === 'left') return 'left';
      if (alignment === 'bottom' || alignment === 'right') return 'right';
      return 'right';
    }
  };

  const renderItems = () => {
    const effectiveAlignment = getEffectiveAlignment();
    
    return (
      <>
        {items.map((item, index) => {
          if (isMobile && item.hideOnMobile) {
            return null;
          }

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
      </>
    );
  };

  const customStyles: React.CSSProperties = {
    ...(font && { fontFamily: font }),
    ...(fontColor && { color: fontColor }),
    ...(backgroundColor && { backgroundColor: backgroundColor }),
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setOpenDropdown(null);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(null);
  };

  const renderMobileToggle = () => {
    return (
      <button
        className={cn(
          'navbar__mobile-toggle',
          isMobile && 'navbar__mobile-toggle--visible'
        )}
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

  const renderVersionDisplay = () => {
    if (!displayShmoobiumVersion) {
      return null;
    }

    const getVersionPosition = () => {
      switch (safePosition) {
        case 'top':
          return { bottom: '8px', right: '8px' };
        case 'bottom':
          return { top: '8px', right: '8px' };
        case 'left':
          return { bottom: '8px', right: '8px' };
        case 'right':
          return { bottom: '8px', left: '8px' };
        default:
          return { bottom: '8px', right: '8px' };
      }
    };

    const versionContent = (
      <div 
        className="navbar__version-display"
        style={{
          position: 'fixed',
          ...getVersionPosition(),
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500',
          zIndex: 99999,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        Shmoobium v{VERSION}
      </div>
    );

    return createPortal(versionContent, document.body);
  };

  return (
    <>
      <nav 
        ref={navbarRef}
        className={cn(
          'navbar',
          `navbar--${safePosition}`,
          `navbar--${style}`,
          isMobile && 'navbar--mobile',
          className
        )}
        style={customStyles}
      >
        <div className="navbar__container">
          <div ref={iconRef}>
            {renderIcon()}
          </div>
          <div ref={itemsRef} className={cn('navbar__items', `navbar__items--${getEffectiveAlignment()}`)}>
            {renderItems()}
          </div>
        </div>
        {renderMobileToggle()}
      </nav>
      
      <MobileMenuPortal
        isOpen={mobileMenuOpen && isMobile}
        onClose={closeMobileMenu}
        items={items}
        slideover={slideover}
        position={safePosition}
        mobileDropdownOpen={mobileDropdownOpen}
        setMobileDropdownOpen={setMobileDropdownOpen}
        isItemActive={isItemActive}
        customStyles={customStyles}
      />
      
      {renderVersionDisplay()}
    </>
  );
};

const MobileMenuPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: NavbarItem[];
  slideover: string;
  position: string;
  mobileDropdownOpen: number | null;
  setMobileDropdownOpen: (index: number | null) => void;
  isItemActive: (item: NavbarItem) => boolean;
  customStyles: React.CSSProperties;
}> = ({ isOpen, onClose, items, slideover, position, mobileDropdownOpen, setMobileDropdownOpen, isItemActive, customStyles }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
  
  let slideoverPosition = position;
  if (position === 'left') {
    slideoverPosition = 'right';
  }
  
  const positionClass = `navbar__mobile-menu--${slideoverPosition}`;
  const visibleClass = isVisible ? 'navbar__mobile-menu--visible' : '';

  const menuContent = (
    <div ref={menuRef} className={cn('navbar__mobile-menu', menuClass, positionClass, visibleClass)} style={customStyles}>
      <div className="navbar__mobile-items">
        {items.map((item, index) => {         
          if (item.hideOnMobile) {
            return null;
          }
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

  return createPortal(menuContent, document.body);
};