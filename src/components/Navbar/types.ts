export interface NavbarItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  dropdown?: NavbarItem[];
  hideOnMobile?: boolean;
}

export interface NavbarIcon {
  src?: string;
  alt?: string;
  component?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export type NavbarPosition = 'top' | 'bottom' | 'left' | 'right';
export type NavbarStyle = 'default' | 'floating';
export type NavbarAlignment = 'top' | 'bottom' | 'left' | 'right';
export type SlideoverStyle = 'default' | 'bubble';

export interface NavbarProps {
  items: NavbarItem[];
  icon?: NavbarIcon;
  logoText?: string;
  logoHref?: string;
  position?: NavbarPosition;
  style?: NavbarStyle;
  slideover?: SlideoverStyle;
  alignment?: NavbarAlignment;
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  onItemClick?: (item: NavbarItem) => void;
} 