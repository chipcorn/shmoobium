// Data attribute system - main export
export { initializeShmoobiumComponents } from './utils/data-attributes';

// Version
export { VERSION } from './version';

// Legacy React components (for backward compatibility)
export { Navbar } from './components/Navbar';
export { createIcon } from './components/Navbar/Navbar';
export { StickerBox } from './components/StickerBox';

// Utilities
export { cn } from './utils/classNames';

// Type exports (for TypeScript users)
export type { 
  NavbarProps, 
  NavbarItem
} from './components/Navbar/types';

export type {
  StickerBoxProps,
  Sticker,
  PlacedSticker
} from './components/StickerBox/types';

import './utils/data-attributes';

import './components/Navbar/Navbar.css';
import './components/StickerBox/StickerBox.css';