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
export type NavbarStyle = 'default' | 'floating' | 'clear';
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
  displayShmoobiumVersion?: boolean;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  onItemClick?: (item: NavbarItem) => void;
}

export interface NavbarBrandProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export interface NavbarItemsProps {
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
}

export interface NavbarItemProps {
  href?: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface NavbarDropdownProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

export interface NavbarTheme {
  navbar: {
    base: string;
    positions: Record<string, string>;
    variants: Record<string, string>;
  };
  brand: {
    base: string;
  };
  items: {
    base: string;
    alignment: Record<string, string>;
  };
  item: {
    base: string;
    states: {
      default: string;
      active: string;
      hover: string;
    };
  };
  dropdown: {
    trigger: string;
    menu: string;
    item: string;
  };
} 