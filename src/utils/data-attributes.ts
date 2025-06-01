import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, createIcon } from '../components/Navbar/Navbar';
import { StickerBox } from '../components/StickerBox';
import { loadNavbar } from './navbar-loader';

interface ComponentConfig {
  [key: string]: any;
}

interface ShmoobiumElement extends HTMLElement {
  _shmoobiumInitialized?: boolean;
}

type ComponentType = 'navbar' | 'sticker-container';

const defaultConfigs: Record<ComponentType, ComponentConfig> = {
  navbar: {
    position: 'top',
    style: 'default',
    slideover: 'default',
    alignment: 'right',
    logoText: 'Shmoobium',
    logoHref: 'index.html',
    fontColor: '#ffffff',
    backgroundColor: '#141414',
    displayShmoobiumVersion: false,
    iconSrc: 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp',
    iconAlt: 'Logo'
  },
  'sticker-container': {
    maxStickers: 15,
    enableSounds: true,
    spawnRadius: 150,
    stickerBoxOnMobile: true
  }
};

function convertShmoobiumColors(value: string): string {
  const colorMap: Record<string, string> = {
    'shm-blue': '#4485ca',
    'shm-red': '#ab3031',
    'shm-green': '#52cd7d',
    'shm-pink': '#bd63d0'
  };
  
  return colorMap[value] || value;
}

function parseDataAttributes(element: HTMLElement, componentType: ComponentType): ComponentConfig {
  const config = { ...defaultConfigs[componentType] };
  
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') && attr.name !== 'data-shmoobium') {
      const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      let value: any = attr.value;
      
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      else {
        value = convertShmoobiumColors(value);
      }
      
      config[key] = value;
    }
  });
  
  return config;
}

function initializeNavbar(element: ShmoobiumElement) {
  if (element._shmoobiumInitialized) return;
  
  const config = parseDataAttributes(element, 'navbar');
  
  const navItems = Array.from(element.querySelectorAll('[data-nav-item]')).map(item => {
    const linkElement = item as HTMLAnchorElement;
    const hasDropdown = linkElement.dataset.dropdown === 'true';
    const isDisabled = linkElement.dataset.disabled === 'true';
    
    let dropdownItems: any[] | undefined = undefined;
    let mainLabel = '';
    
    if (hasDropdown) {
      const dropdownElements = Array.from(linkElement.querySelectorAll('[data-dropdown-item]'));
      
      if (dropdownElements.length > 0) {
        dropdownItems = dropdownElements.map(dropItem => {
          const dropLink = dropItem as HTMLAnchorElement;
          const label = dropLink.textContent?.trim() || '';
          const dropIsDisabled = dropLink.dataset.disabled === 'true';
          return {
            label: label,
            href: dropLink.href || '#',
            disabled: dropIsDisabled,
            icon: dropLink.dataset.icon ? createIcon(dropLink.dataset.icon, label) : undefined
          };
        });
        
        const firstTextNode = linkElement.childNodes[0];
        if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
          mainLabel = firstTextNode.textContent?.trim() || '';
        }
        
        if (!mainLabel) {
          mainLabel = 'Dropdown';
        }
      }
    } else {
      mainLabel = linkElement.textContent?.trim() || '';
    }
    
    const result = {
      label: mainLabel,
      href: hasDropdown ? '#' : (linkElement.href || '#'),
      disabled: isDisabled,
      icon: linkElement.dataset.icon ? createIcon(linkElement.dataset.icon, mainLabel) : undefined,
      dropdown: dropdownItems
    };
    
    return result;
  });
  
  const navbarProps = {
    position: config.position,
    style: config.style,
    slideover: config.slideover,
    alignment: config.alignment,
    logoText: config.logoText,
    logoHref: config.logoHref,
    fontColor: config.fontColor,
    backgroundColor: config.backgroundColor,
    displayShmoobiumVersion: config.displayShmoobiumVersion,
    items: navItems,
    icon: {
      src: config.iconSrc,
      alt: config.iconAlt
    },
    className: 'navbar',
    itemClassName: 'navbar-item',
    iconClassName: 'navbar-icon',
    onItemClick: (item: any) => {
      
    }
  };
  
  element.innerHTML = '';
  
  const navbarElement = React.createElement(Navbar, navbarProps);
  ReactDOM.render(navbarElement, element);
  
  element._shmoobiumInitialized = true;
}

let stickerBoxInstance: any = null;

function initializeStickerContainer(element: ShmoobiumElement) {
  if (element._shmoobiumInitialized) return;
  
  const config = parseDataAttributes(element, 'sticker-container');
  
  const stickers = Array.from(element.querySelectorAll('[data-sticker]')).map((img, index) => {
    const imgElement = img as HTMLImageElement;
    return {
      id: (index + 1).toString(),
      name: imgElement.alt || `Sticker ${index + 1}`,
      image: imgElement.src,
      enabled: imgElement.dataset.enabled === 'true' || false
    };
  });
  
  const stickerBoxProps = {
    stickers: stickers,
    maxStickers: config.maxStickers,
    spawnRadius: config.spawnRadius,
    enableSounds: config.enableSounds,
    className: 'sticker-box',
    onStickerToggle: (stickerId: string, enabled: boolean) => {
      
    },
    onStickerMove: (stickerId: string, position: any) => {
      
    }
  };
  
  element.innerHTML = '';
  
  const stickerBoxElement = React.createElement(StickerBox, {
    ...stickerBoxProps,
    ref: (ref: any) => {
      stickerBoxInstance = ref;
      
      (window as any).openStickerBox = function() {
        if (stickerBoxInstance && typeof stickerBoxInstance.openPopup === 'function') {
          stickerBoxInstance.openPopup();
        }
      };
    }
  });
  
  ReactDOM.render(stickerBoxElement, element);
  
  element._shmoobiumInitialized = true;
}

export function initializeShmoobiumComponents() {
  const components = document.querySelectorAll('[data-shmoobium]');
  
  components.forEach(element => {
    initSingle(element);
  });
  
  const navbarContainer = document.getElementById('navbar');
  if (navbarContainer) {
    const navbarSrc = navbarContainer.getAttribute('data-navbar-src');
    if (navbarSrc && !(navbarContainer as ShmoobiumElement)._shmoobiumInitialized) {
      (navbarContainer as ShmoobiumElement)._shmoobiumInitialized = true;
      loadNavbar(navbarSrc, '#navbar').catch(error => {
        console.error('Failed to auto-load navbar:', error);
        (navbarContainer as ShmoobiumElement)._shmoobiumInitialized = false;
      });
    }
  }
}

export function initSingle(element: Element) {
  const componentType = element.getAttribute('data-shmoobium') as ComponentType;
  const htmlElement = element as ShmoobiumElement;
  
  switch (componentType) {
    case 'navbar':
      initializeNavbar(htmlElement);
      break;
    case 'sticker-container':
      initializeStickerContainer(htmlElement);
      break;
  }
}

if (typeof window !== 'undefined') {
  window.Shmoobium = {
    init: initializeShmoobiumComponents,
    loadNavbar: loadNavbar,
    initSingle: initSingle
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShmoobiumComponents);
  } else {
    initializeShmoobiumComponents();
  }
} 