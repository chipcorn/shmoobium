export function loadNavbar(src: string, targetSelector: string = '#navbar'): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(src)
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
        
        resolve();
      })
      .catch(error => {
        console.error('Error loading navbar:', error);
        reject(error);
      });
  });
}

export function createSimpleNavbar(config: any): string {
  const items = config.items || [];
  const logoText = config.logoText || 'Shmoobium';
  const logoHref = config.logoHref || '/';
  const backgroundColor = config.backgroundColor || '#141414';
  const fontColor = config.fontColor || '#ffffff';
  
  let navItems = '';
  items.forEach((item: any) => {
    if (item.dropdown && item.dropdown.length > 0) {
      let dropdownItems = '';
      item.dropdown.forEach((dropItem: any) => {
        dropdownItems += `<a href="${dropItem.href}" data-dropdown-item>${dropItem.label}</a>`;
      });
      navItems += `
        <div data-nav-item data-dropdown="true">
          ${item.label}
          ${dropdownItems}
        </div>`;
    } else {
      navItems += `<a href="${item.href}" data-nav-item>${item.label}</a>`;
    }
  });
  
  return `
    <nav data-shmoobium="navbar" 
         data-background-color="${backgroundColor}"
         data-font-color="${fontColor}"
         data-logo-text="${logoText}"
         data-logo-href="${logoHref}"
         style="background: ${backgroundColor}; color: ${fontColor};">
      ${navItems}
    </nav>
  `;
}

declare global {
  interface Window {
    Shmoobium: {
      init(): void;
      loadNavbar(src: string, targetSelector?: string): Promise<void>;
      initSingle?(element: Element): void;
      createSimpleNavbar?(config: any): string;
    };
  }
} 