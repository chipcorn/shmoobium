export interface StickerSettings {
  enableSounds: boolean;
  spawnRadius: number;
  maxStickers: number;
  stickerBoxOnMobile: boolean;
}

const defaultStickerSettings: StickerSettings = {
  enableSounds: true,
  spawnRadius: 150,
  maxStickers: 20,
  stickerBoxOnMobile: false,
};

let cachedStickerSettings: StickerSettings | null = null;

export const loadStickerSettings = (): StickerSettings => {
  if (cachedStickerSettings) {
    return cachedStickerSettings;
  }

  let settings = { ...defaultStickerSettings };

  try {
    // Check if sticker settings are available in global scope
    const globalStickerSettings = (window as any).stickerSettings;
    if (globalStickerSettings) {
      settings = { ...defaultStickerSettings, ...globalStickerSettings };
    }
  } catch (error) {
    console.warn('Failed to load sticker settings:', error);
  }

  cachedStickerSettings = settings;
  return settings;
};

export const getStickerSettings = (): StickerSettings => {
  return loadStickerSettings();
}; 