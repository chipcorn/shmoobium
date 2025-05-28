import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/classNames';
import { getStickerSettings } from '../../utils/stickerSettings';
import { StickerBoxProps, Sticker, PlacedSticker } from './types';
import './StickerBox.css';

const STORAGE_KEY = 'shmoobium-stickers';

export interface StickerBoxRef {
  openPopup: () => void;
  closePopup: () => void;
}

export const StickerBox = forwardRef<StickerBoxRef, StickerBoxProps>(({
  stickers,
  maxStickers,
  spawnRadius,
  enableSounds,
  pickupSound = '/src/assets/StickerPeel.mp3',
  placeSound = '/src/assets/StickerPlace.mp3',
  className,
  onStickerToggle,
  onStickerMove,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [draggedSticker, setDraggedSticker] = useState<PlacedSticker | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nextZIndex, setNextZIndex] = useState(1001);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const settings = getStickerSettings();
  
  useEffect(() => {
    const checkScreenSize = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const finalMaxStickers = maxStickers ?? settings.maxStickers;
  const finalSpawnRadius = spawnRadius ?? settings.spawnRadius;
  const finalEnableSounds = enableSounds ?? settings.enableSounds;

  useImperativeHandle(ref, () => ({
    openPopup: () => {
      initAudio();
      setIsOpen(true);
    },
    closePopup: () => setIsOpen(false),
  }));

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedStickers = JSON.parse(saved);
        setPlacedStickers(savedStickers);
        
        const maxZ = Math.max(...savedStickers.map((s: PlacedSticker) => s.zIndex), 1000);
        setNextZIndex(maxZ + 1);
      } catch (error) {
        console.warn('Failed to load stickers from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (placedStickers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(placedStickers));
    }
  }, [placedStickers]);

  const initAudio = useCallback(() => {
    if (!finalEnableSounds || audioContextRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [finalEnableSounds]);

  const playSound = useCallback(async (soundPath: string) => {
    if (!finalEnableSounds) return;
    
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.3;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, [finalEnableSounds]);

  const toggleSticker = useCallback((stickerId: string) => {
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;

    const isCurrentlyEnabled = placedStickers.some(p => p.id === stickerId);
    
    if (isCurrentlyEnabled) {
      setPlacedStickers(prev => prev.filter(p => p.id !== stickerId));
    } else {
      if (placedStickers.length >= finalMaxStickers) {
        alert(`Maximum ${finalMaxStickers} stickers allowed!`);
        return;
      }

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * finalSpawnRadius + 50;
      const x = centerX + Math.cos(angle) * distance - 40;
      const y = centerY + Math.sin(angle) * distance - 40;

      const newSticker: PlacedSticker = {
        ...sticker,
        position: { x, y },
        zIndex: nextZIndex,
        enabled: true,
      };

      setPlacedStickers(prev => [...prev, newSticker]);
      setNextZIndex(prev => prev + 1);
      
      playSound(pickupSound);
    }

    onStickerToggle?.(stickerId, !isCurrentlyEnabled);
  }, [stickers, placedStickers, finalMaxStickers, finalSpawnRadius, nextZIndex, pickupSound, playSound, onStickerToggle]);

  const resetAllStickers = useCallback(() => {
    setPlacedStickers([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleStickerMouseDown = useCallback((e: React.MouseEvent, sticker: PlacedSticker) => {
    e.preventDefault();
    initAudio();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedSticker({ ...sticker, isDragging: true });
    
    const newZIndex = nextZIndex;
    setNextZIndex(prev => prev + 1);
    setPlacedStickers(prev => 
      prev.map(p => p.id === sticker.id ? { ...p, zIndex: newZIndex } : p)
    );
    
    playSound(pickupSound);
  }, [nextZIndex, pickupSound, playSound, initAudio]);

  useEffect(() => {
    if (!draggedSticker) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setPlacedStickers(prev =>
        prev.map(p =>
          p.id === draggedSticker.id
            ? { ...p, position: { x: newX, y: newY } }
            : p
        )
      );
    };

    const handleMouseUp = () => {
      if (draggedSticker) {
        playSound(placeSound);
        onStickerMove?.(draggedSticker.id, draggedSticker.position);
      }
      setDraggedSticker(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSticker, dragOffset, placeSound, playSound, onStickerMove]);

  const handleStickerTouchStart = useCallback((e: React.TouchEvent, sticker: PlacedSticker) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedSticker({ ...sticker, isDragging: true });
    
    playSound(pickupSound);
  }, [pickupSound, playSound]);

  useEffect(() => {
    if (!draggedSticker) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      setPlacedStickers(prev =>
        prev.map(p =>
          p.id === draggedSticker.id
            ? { ...p, position: { x: newX, y: newY } }
            : p
        )
      );
    };

    const handleTouchEnd = () => {
      if (draggedSticker) {
        playSound(placeSound);
        onStickerMove?.(draggedSticker.id, draggedSticker.position);
      }
      setDraggedSticker(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedSticker, dragOffset, placeSound, playSound, onStickerMove]);

  const renderPopup = () => {
    if (!isOpen) return null;

    const popupContent = (
      <>
        <div 
          className={cn('sticker-box__overlay', isOpen && 'sticker-box__overlay--visible')}
          onClick={() => setIsOpen(false)}
        />
        <div className={cn(
          'sticker-box__popup',
          isOpen ? 'sticker-box__popup--visible' : 'sticker-box__popup--hidden',
          className
        )}>
          <div className="sticker-box__header">
            <h2 className="sticker-box__title">Sticker Box</h2>
            <div className="sticker-box__header-buttons">
              <button 
                className="sticker-box__reset"
                onClick={resetAllStickers}
                type="button"
              >
                Reset All
              </button>
              <button 
                className="sticker-box__close"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          <div className="sticker-box__grid">
            {stickers.map((sticker) => {
              const isEnabled = placedStickers.some(p => p.id === sticker.id);
              return (
                <div
                  key={sticker.id}
                  className={cn(
                    'sticker-box__item',
                    isEnabled && 'sticker-box__item--enabled'
                  )}
                  onClick={() => toggleSticker(sticker.id)}
                >
                  <img
                    src={sticker.image}
                    alt={sticker.name}
                    className="sticker-box__sticker-image"
                  />
                  <div className="sticker-box__sticker-name">{sticker.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );

    return createPortal(popupContent, document.body);
  };

  const renderPlacedStickers = () => {
    return placedStickers.map((sticker) => (
      <div
        key={sticker.id}
        className={cn(
          'sticker-box__placed-sticker',
          sticker.isDragging && 'sticker-box__placed-sticker--dragging'
        )}
        style={{
          left: sticker.position.x,
          top: sticker.position.y,
          zIndex: sticker.zIndex,
        }}
        onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
        onTouchStart={(e) => handleStickerTouchStart(e, sticker)}
      >
        <img src={sticker.image} alt={sticker.name} draggable={false} />
      </div>
    ));
  };

  if (isSmallScreen && !settings.stickerBoxOnMobile) {
    return null;
  }

  return (
    <>
      {renderPopup()}
      {createPortal(renderPlacedStickers(), document.body)}
    </>
  );
});

StickerBox.displayName = 'StickerBox'; 