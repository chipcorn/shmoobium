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
        
        if (window.Shmoobium && window.Shmoobium.init) {
          window.Shmoobium.init();
        }
        
        resolve();
      })
      .catch(error => {
        console.error('Error loading navbar:', error);
        reject(error);
      });
  });
}

declare global {
  interface Window {
    Shmoobium: {
      init(): void;
      loadNavbar(src: string, targetSelector?: string): Promise<void>;
    };
  }
} 