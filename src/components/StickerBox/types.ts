export interface Sticker {
  id: string;
  name: string;
  image: string;
  enabled: boolean;
  position?: {
    x: number;
    y: number;
  };
  zIndex?: number;
}

export interface StickerBoxProps {
  stickers: Sticker[];
  maxStickers?: number;
  spawnRadius?: number;
  enableSounds?: boolean;
  className?: string;
  onStickerToggle?: (stickerId: string, enabled: boolean) => void;
  onStickerMove?: (stickerId: string, position: { x: number; y: number }) => void;
}

export type StickerSize = 'small' | 'medium' | 'large';

export interface PlacedSticker extends Sticker {
  position: {
    x: number;
    y: number;
  };
  zIndex: number;
  isDragging?: boolean;
  size?: StickerSize;
} 