export interface NavbarSettings {
  navbarColor: string;
  navbarTextColor: string;
  displayShmoobiumVersion: boolean;
}

const defaultNavbarSettings: NavbarSettings = {
  navbarColor: '#141414',
  navbarTextColor: '#ffffff',
  displayShmoobiumVersion: false,
};

let cachedNavbarSettings: NavbarSettings | null = null;

export const loadNavbarSettings = (): NavbarSettings => {
  if (cachedNavbarSettings) {
    return cachedNavbarSettings;
  }

  let settings = { ...defaultNavbarSettings };

  try {
    // Check if navbar settings are available in global scope
    const globalNavbarSettings = (window as any).navbarSettings;
    if (globalNavbarSettings) {
      settings = { ...defaultNavbarSettings, ...globalNavbarSettings };
    }
  } catch (error) {
    console.warn('Failed to load navbar settings:', error);
  }

  cachedNavbarSettings = settings;
  return settings;
};

export const getNavbarSettings = (): NavbarSettings => {
  return loadNavbarSettings();
}; 