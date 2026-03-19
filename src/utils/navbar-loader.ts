export function loadNavbar(src: string, targetSelector: string = '#navbar', options?: { timeout?: number }): Promise<void> {
  const timeout = options?.timeout ?? 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return new Promise((resolve, reject) => {
    fetch(src, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load navbar: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
          throw new Error(`Target element "${targetSelector}" not found`);
        }
        
        targetElement.innerHTML = html;
        
        const navbarElement = targetElement.querySelector('[data-shmoobium="navbar"]');
        if (navbarElement && window.Shmoobium && typeof window.Shmoobium.initSingle === 'function') {
          window.Shmoobium.initSingle(navbarElement);
        }
        
        clearTimeout(timeoutId);
        resolve();
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error('Error loading navbar:', error);
        reject(error);
      });
  });
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createSimpleNavbar(config: any): string {
  const items = config.items || [];
  const logoText = escapeHtml(config.logoText || 'Shmoobium');
  const logoHref = escapeHtml(config.logoHref || '/');
  const backgroundColor = escapeHtml(config.backgroundColor || '#141414');
  const fontColor = escapeHtml(config.fontColor || '#ffffff');
  
  let navItems = '';
  items.forEach((item: any) => {
    const label = escapeHtml(item.label || '');
    const href = escapeHtml(item.href || '#');
    if (item.dropdown && item.dropdown.length > 0) {
      let dropdownItems = '';
      item.dropdown.forEach((dropItem: any) => {
        const dropLabel = escapeHtml(dropItem.label || '');
        const dropHref = escapeHtml(dropItem.href || '#');
        dropdownItems += `<a href="${dropHref}" data-dropdown-item>${dropLabel}</a>`;
      });
      navItems += `<div data-nav-item data-dropdown="true">${label}${dropdownItems}</div>`;
    } else {
      navItems += `<a href="${href}" data-nav-item>${label}</a>`;
    }
  });
  
  return `<nav data-shmoobium="navbar" data-background-color="${backgroundColor}" data-font-color="${fontColor}" data-logo-text="${logoText}" data-logo-href="${logoHref}" style="background: ${backgroundColor}; color: ${fontColor};">${navItems}</nav>`;
}

declare global {
  interface Window {
    Shmoobium: {
      init(): void;
      loadNavbar(src: string, targetSelector?: string, options?: { timeout?: number }): Promise<void>;
      initSingle?(element: Element): void;
      createSimpleNavbar?(config: any): string;
    };
  }
} 