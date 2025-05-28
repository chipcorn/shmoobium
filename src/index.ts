// Main exports
export { Navbar, createIcon } from './components/Navbar/Navbar';
export { StickerBox } from './components/StickerBox';
export { cn } from './utils/classNames';
export { getNavbarSettings, loadNavbarSettings } from './utils/navbarSettings';
export { getStickerSettings, loadStickerSettings } from './utils/stickerSettings';

// Type exports
export type { 
  NavbarProps, 
  NavbarItem, 
  NavbarIcon, 
  NavbarPosition, 
  NavbarStyle, 
  NavbarAlignment,
  SlideoverStyle
} from './components/Navbar/types';

export type {
  StickerBoxProps,
  Sticker,
  PlacedSticker,
  StickerBoxRef
} from './components/StickerBox';

export type { NavbarSettings } from './utils/navbarSettings';
export type { StickerSettings } from './utils/stickerSettings';