export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const conditionalClass = (condition: boolean, trueClass: string, falseClass?: string): string => {
  return condition ? trueClass : falseClass || '';
};

export const variantClass = (base: string, variant?: string): string => {
  return variant ? `${base} ${base}--${variant}` : base;
};

export const sizeClass = (base: string, size?: string): string => {
  return size ? `${base} ${base}--${size}` : base;
}; 