// Data attribute system - main export
export { initializeShmoobiumComponents, initSingle } from './utils/data-attributes';

// Version
export { VERSION } from './version';

// Legacy React components (for backward compatibility)
export { Navbar } from './components/Navbar';
export { createIcon } from './components/Navbar/Navbar';

// Utilities
export { cn } from './utils/classNames';
export { loadNavbar, createSimpleNavbar } from './utils/navbar-loader';
export { initHighlightFilter, destroyHighlightFilter } from './utils/highlight-init';
// Type exports (for TypeScript users)
export type { 
  NavbarProps, 
  NavbarItem
} from './components/Navbar/types';

import './utils/data-attributes';
import { loadNavbar } from './utils/navbar-loader';
import { initHighlightFilter } from './utils/highlight-init';

import './components/Navbar/Navbar.css';
import './components/Highlight/Highlight.css';

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHighlightFilter);
  } else {
    initHighlightFilter();
  }
}