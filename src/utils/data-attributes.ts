import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, createIcon } from '../components/Navbar/Navbar';
import { StickerBox } from '../components/StickerBox';

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
    
    console.log('=== Processing nav item ===');
    console.log('Element:', linkElement);
    console.log('Has dropdown:', hasDropdown);
    console.log('Full HTML:', linkElement.outerHTML);
    
    let dropdownItems: any[] | undefined = undefined;
    let mainLabel = '';
    
    if (hasDropdown) {
      const dropdownElements = Array.from(linkElement.querySelectorAll('[data-dropdown-item]'));
      console.log('Found dropdown elements count:', dropdownElements.length);
      
      if (dropdownElements.length > 0) {
        dropdownItems = dropdownElements.map(dropItem => {
          const dropLink = dropItem as HTMLAnchorElement;
          const label = dropLink.textContent?.trim() || '';
          console.log('Dropdown item found:', label, dropLink.href);
          return {
            label: label,
            href: dropLink.href || '#',
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
      
      console.log('Processed dropdown items:', dropdownItems);
      console.log('Main label extracted:', mainLabel);
    } else {
      mainLabel = linkElement.textContent?.trim() || '';
    }
    
    const result = {
      label: mainLabel,
      href: hasDropdown ? '#' : (linkElement.href || '#'),
      icon: linkElement.dataset.icon ? createIcon(linkElement.dataset.icon, mainLabel) : undefined,
      dropdown: dropdownItems
    };
    
    console.log('Final nav item result:', result);
    console.log('=== End processing ===');
    
    return result;
  });
  
  console.log('ALL FINAL NAV ITEMS:', navItems);
  
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
      console.log('Navbar item clicked:', item.label);
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
      console.log(`Sticker ${stickerId} ${enabled ? 'enabled' : 'disabled'}`);
    },
    onStickerMove: (stickerId: string, position: any) => {
      console.log(`Sticker ${stickerId} moved to:`, position);
    }
  };
  
  element.innerHTML = '';
  
  const stickerBoxElement = React.createElement(StickerBox, {
    ...stickerBoxProps,
    ref: (ref: any) => {
      console.log('StickerBox ref set:', ref);
      stickerBoxInstance = ref;
      
      (window as any).openStickerBox = function() {
        console.log('Opening sticker box...');
        if (stickerBoxInstance && typeof stickerBoxInstance.openPopup === 'function') {
          stickerBoxInstance.openPopup();
        } else {
          console.error('StickerBox instance or openPopup method not found!');
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
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShmoobiumComponents);
  } else {
    initializeShmoobiumComponents();
  }
} 