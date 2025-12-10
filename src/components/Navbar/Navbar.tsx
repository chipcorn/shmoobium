import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/classNames';
import { NavbarProps, NavbarItem } from './types';
import { VERSION } from '../../version';
import './Navbar.css';

export const createIcon = (src: string, alt: string, size: number = 32): React.ReactElement => {
  return React.createElement('img', {
    src: src,
    alt: alt,
    style: { width: `${size}px`, height: `${size}px` },
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.dataset.fallbackAttempted !== 'true') {
        img.dataset.fallbackAttempted = 'true';
        img.src = 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp';
      }
    }
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
    
    const availableSpace = navbarWidth - iconWidth - 70 + 50;
    const itemsFit = estimatedWidth <= availableSpace;
    
    return itemsFit;
  }, [safePosition, items, isMobile]);

  useEffect(() => {
    const effectivePosition = isMobile && (safePosition === 'left' || safePosition === 'right') ? 'top' : safePosition;
    
    const bodyClassMap = {
      'top': style === 'floating' ? 'navbar-floating-top' : style === 'clear' ? 'navbar-clear-top' : style === 'goober' ? 'navbar-goober-top' : 'navbar-top',
      'bottom': style === 'floating' ? 'navbar-floating-bottom' : style === 'clear' ? 'navbar-clear-bottom' : style === 'goober' ? 'navbar-goober-bottom' : 'navbar-bottom',
      'left': style === 'floating' ? 'navbar-floating-left' : style === 'clear' ? 'navbar-clear-left' : style === 'goober' ? 'navbar-goober-left' : 'navbar-left',
      'right': style === 'floating' ? 'navbar-floating-right' : style === 'clear' ? 'navbar-clear-right' : style === 'goober' ? 'navbar-goober-right' : 'navbar-right',
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

    if (style === 'goober' && backgroundColor) {
      const getBackgroundColorRgba = (bgColor: string, opacity: number): string => {
        let hex = bgColor.replace('#', '');
        if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
        }
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };
      document.body.style.setProperty('--navbar-goober-shadow-top', getBackgroundColorRgba(backgroundColor, 0.95));
      document.body.style.setProperty('--navbar-goober-shadow-mid', getBackgroundColorRgba(backgroundColor, 0.6));
    }

    setCurrentUrl(window.location.href);

    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      const itemsFit = checkIfItemsFit();
      
      // Force mobile for left/right navbars on small screens OR when items don't fit
      const shouldBeMobile = isSmallScreen && (safePosition === 'left' || safePosition === 'right') || !itemsFit;
      
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
      
      if (!target.closest('.navbar__dropdown-container') && !target.closest('.navbar__dropdown')) {
        setOpenDropdown(null);
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
      if (style === 'goober') {
        document.body.style.removeProperty('--navbar-goober-shadow-top');
        document.body.style.removeProperty('--navbar-goober-shadow-mid');
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [safePosition, style, checkIfItemsFit, isMobile, backgroundColor]);

  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen, isMobile]);

  const isItemActive = (item: NavbarItem): boolean => {
    if (!item.href) return false;
    
    const currentPath = window.location.pathname;
    const currentPage = window.location.pathname.split('/').pop() || '';
    const currentHref = window.location.href;
    
    const itemHref = item.href;
    
    if (currentPage === '' || currentPath === '/') {
      if (itemHref === '/' || itemHref === 'index.html') {
        return true;
      }
    }
    
    if (itemHref === currentHref) {
      return true;
    }
    
    if (itemHref === currentPath) {
      return true;
    }
    
    const itemPage = itemHref.split('/').pop() || '';
    if (itemPage === currentPage && currentPage !== '') {
      return true;
    }
    
    if (itemHref === 'index.html' && currentPage === 'index.html') {
      return true;
    }
    
    if (itemHref.startsWith('#') && currentHref.includes(itemHref)) {
      return true;
    }
    
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
    const img = event.currentTarget;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp';
    }
  };

  const getTextShadowStyle = (bgColor: string): React.CSSProperties => {
    // Convert hex to rgba for shadow
    let hex = bgColor.replace('#', '');
    // Handle 3-digit hex codes
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { textShadow: `0 2px 6px rgba(${r}, ${g}, ${b}, 0.5), 0 1px 3px rgba(${r}, ${g}, ${b}, 0.3)` };
  };

  const getShadowColorRgba = (bgColor: string): string => {
    // Convert hex to rgba for box-shadow
    let hex = bgColor.replace('#', '');
    // Handle 3-digit hex codes
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
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

    const logoTextStyles: React.CSSProperties = {};
    if (backgroundColor && style === 'clear') {
      Object.assign(logoTextStyles, getTextShadowStyle(backgroundColor));
    }

    const logoContent = (
      <>
        {iconElement}
        {logoText && <span className="navbar__logo-text" style={logoTextStyles}>{logoText}</span>}
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

    const dropdownStyles: React.CSSProperties = {};
    if (backgroundColor && style !== 'clear') {
      dropdownStyles.backgroundColor = backgroundColor;
    }
    if (backgroundColor && style === 'clear') {
      const shadowRgba = getShadowColorRgba(backgroundColor);
      dropdownStyles.boxShadow = `0 2px 8px ${shadowRgba}`;
    }

    return (
      <div className="navbar__dropdown" style={dropdownStyles}>
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

  const getEffectivePosition = () => {
    if (isMobile && (safePosition === 'left' || safePosition === 'right')) {
      return 'top';
    }
    return safePosition;
  };

  const getEffectiveAlignment = () => {
    const effectivePosition = getEffectivePosition();
    
    if (effectivePosition === 'left' || effectivePosition === 'right') {
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
                  {item.icon && <span className="navbar__item-icon" style={style === 'clear' && backgroundColor ? getTextShadowStyle(backgroundColor) : {}}>{item.icon}</span>}
                  <span className="navbar__item-label" style={style === 'clear' && backgroundColor ? getTextShadowStyle(backgroundColor) : {}}>{item.label} ▼</span>
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

  const getShadowColor = (bgColor: string): string => {
    // Convert hex to rgba for shadow
    let hex = bgColor.replace('#', '');
    // Handle 3-digit hex codes
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `0 2px 6px rgba(${r}, ${g}, ${b}, 0.5), 0 1px 3px rgba(${r}, ${g}, ${b}, 0.3)`;
  };

  const customStyles: React.CSSProperties = {
    ...(font && { fontFamily: font }),
    ...(fontColor && { color: fontColor }),
    ...(backgroundColor && style === 'clear' ? {} : style === 'goober' ? {} : { backgroundColor: backgroundColor }),
    ...(backgroundColor && style === 'clear' && {
      '--navbar-shadow-color': getShadowColor(backgroundColor),
      '--navbar-shadow-color-rgba': getShadowColorRgba(backgroundColor)
    } as React.CSSProperties),
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

  const renderProgressiveBlur = () => {
    if (style !== 'goober' || getEffectivePosition() !== 'top') return null;
    return createPortal(
      <div className="navbar-progressive-blur" />,
      document.body
    );
  };

  return (
    <>
      {renderProgressiveBlur()}
      <nav 
        ref={navbarRef}
        className={cn(
          'navbar',
          `navbar--${getEffectivePosition()}`,
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
        slideover="default"
        position={getEffectivePosition()}
        mobileDropdownOpen={mobileDropdownOpen}
        setMobileDropdownOpen={setMobileDropdownOpen}
        isItemActive={isItemActive}
        customStyles={customStyles}
        style={style}
        backgroundColor={backgroundColor}
        getTextShadowStyle={getTextShadowStyle}
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
  style: string;
  backgroundColor?: string;
  getTextShadowStyle: (bgColor: string) => React.CSSProperties;
}> = ({ isOpen, onClose, items, slideover, position, mobileDropdownOpen, setMobileDropdownOpen, isItemActive, customStyles, style, backgroundColor, getTextShadowStyle }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [menuWidth, setMenuWidth] = React.useState(320);

  const calculateMenuWidth = React.useCallback(() => {
    let maxWidth = 160;
    
    items.forEach(item => {
      const itemTextLength = item.label.length * 8 + 60;
      const hasIcon = !!item.icon;
      let itemWidth = itemTextLength;
      if (hasIcon) itemWidth += 35;
      maxWidth = Math.max(maxWidth, itemWidth);
      
      if (item.dropdown && item.dropdown.length > 0) {
        item.dropdown.forEach(dropdownItem => {
          const dropdownTextLength = dropdownItem.label.length * 8 + 60;
          const dropHasIcon = !!dropdownItem.icon;
          let dropItemWidth = dropdownTextLength;
          if (dropHasIcon) dropItemWidth += 35;
          maxWidth = Math.max(maxWidth, dropItemWidth);
        });
      }
    });
    
    const finalWidth = Math.min(Math.max(maxWidth, 180), 320);
    return finalWidth;
  }, [items]);

  React.useEffect(() => {
    const width = calculateMenuWidth();
    setMenuWidth(width);
  }, [calculateMenuWidth]);

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

    const handleScroll = (event: Event) => {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    const handleResize = () => {
      const width = calculateMenuWidth();
      setMenuWidth(width);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose, calculateMenuWidth]);

  if (!shouldRender) return null;

  const menuClass = 'navbar__mobile-menu--default';
  
  let slideoverPosition = position;
  if (position === 'left') {
    slideoverPosition = 'right';
  }
  
  const positionClass = `navbar__mobile-menu--${slideoverPosition}`;
  const visibleClass = isVisible ? 'navbar__mobile-menu--visible' : '';

  const dynamicStyles = {
    ...customStyles,
    width: `${menuWidth}px !important`,
    minWidth: `${menuWidth}px !important`,
    maxWidth: `${menuWidth}px !important`,
    ...(style === 'clear' && customStyles.backgroundColor ? {
      background: 'transparent !important',
      filter: `drop-shadow(0 0 8px ${customStyles.backgroundColor}) drop-shadow(0 0 16px ${customStyles.backgroundColor})`
    } : {}),
  };

  const menuContent = (
    <div 
      ref={menuRef} 
      className={cn('navbar__mobile-menu', menuClass, positionClass, visibleClass)} 
      style={dynamicStyles}
      onScroll={(e) => e.stopPropagation()}
    >
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
                  {item.icon && <span className="navbar__item-icon" style={style === 'clear' && backgroundColor ? getTextShadowStyle(backgroundColor) : {}}>{item.icon}</span>}
                  <span className="navbar__item-label" style={style === 'clear' && backgroundColor ? getTextShadowStyle(backgroundColor) : {}}>{item.label}</span>
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