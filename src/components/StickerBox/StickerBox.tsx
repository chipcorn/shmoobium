import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/classNames';
import { getStickerSettings } from '../../utils/stickerSettings';
import { StickerBoxProps, Sticker, PlacedSticker, StickerSize } from './types';
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
  className,
  onStickerToggle,
  onStickerMove,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [draggedSticker, setDraggedSticker] = useState<PlacedSticker | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nextZIndex, setNextZIndex] = useState(901);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

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
        const stickersWithDefaults = savedStickers.map((sticker: PlacedSticker) => {
          let position = sticker.position;
          
          if (position.x > 100) {
            const percentX = (position.x / window.innerWidth) * 100;
            position = { x: percentX, y: position.y };
          }
          
          return {
            ...sticker,
            size: sticker.size || 'medium',
            zIndex: sticker.zIndex || 901,
            position: position
          };
        });
        setPlacedStickers(stickersWithDefaults);
        
        const maxZ = Math.max(...stickersWithDefaults.map((s: PlacedSticker) => s.zIndex), 900);
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

  const initAudio = useCallback(async () => {
    if (!finalEnableSounds) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const soundUrls = [
        'https://unpkg.com/shmoobium@latest/dist/assets/StickerPeel.mp3',
        'https://unpkg.com/shmoobium@latest/dist/assets/StickerPlace.mp3'
      ];
      
      for (const url of soundUrls) {
        if (!audioBuffersRef.current.has(url)) {
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            audioBuffersRef.current.set(url, audioBuffer);
          } catch (error) {
            console.warn(`Failed to load sound: ${url}`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }, [finalEnableSounds]);

  const playSound = useCallback(async (soundPath: string) => {
    if (!finalEnableSounds) return;
    
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        const audio = new Audio(soundPath);
        audio.volume = 0.2;
        audio.preload = 'none';
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Mobile audio play failed (this is normal):', error);
          });
        }
        return;
      }
      
      if (audioContextRef.current && audioBuffersRef.current.has(soundPath)) {
        const audioBuffer = audioBuffersRef.current.get(soundPath);
        if (audioBuffer) {
          const source = audioContextRef.current.createBufferSource();
          const gainNode = audioContextRef.current.createGain();
          
          source.buffer = audioBuffer;
          gainNode.gain.value = 0.3;
          
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          
          source.start();
          return;
        }
      }
      
      const audio = new Audio(soundPath);
      audio.volume = 0.3;
      audio.currentTime = 0;
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
      playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPlace.mp3');
    } else {
      if (placedStickers.length >= finalMaxStickers) {
        alert(`Maximum ${finalMaxStickers} stickers allowed!`);
        return;
      }

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * finalSpawnRadius + 50;
      const absoluteX = centerX + Math.cos(angle) * distance - 40;
      const absoluteY = centerY + Math.sin(angle) * distance - 40;
      
      const percentX = (absoluteX / window.innerWidth) * 100;

      const newSticker: PlacedSticker = {
        ...sticker,
        position: { x: percentX, y: absoluteY },
        zIndex: nextZIndex,
        enabled: true,
        size: 'medium',
      };

      setPlacedStickers(prev => [...prev, newSticker]);
      setNextZIndex(prev => prev + 1);
      
      playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPeel.mp3');
    }

    onStickerToggle?.(stickerId, !isCurrentlyEnabled);
  }, [stickers, placedStickers, finalMaxStickers, finalSpawnRadius, nextZIndex, playSound, onStickerToggle]);

  const resetAllStickers = useCallback(() => {
    setPlacedStickers([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const cycleStickerSize = useCallback((stickerId: string) => {
    setPlacedStickers(prev => 
      prev.map(sticker => {
        if (sticker.id === stickerId) {
          const currentSize = sticker.size || 'medium';
          let newSize: StickerSize;
          
          switch (currentSize) {
            case 'small':
              newSize = 'medium';
              break;
            case 'medium':
              newSize = 'large';
              break;
            case 'large':
              newSize = 'small';
              break;
            default:
              newSize = 'medium';
          }
          
          return { ...sticker, size: newSize };
        }
        return sticker;
      })
    );
  }, []);

  const handleStickerMouseDown = useCallback((e: React.MouseEvent, sticker: PlacedSticker) => {
    e.preventDefault();
    
    if (e.shiftKey) {
      cycleStickerSize(sticker.id);
      return;
    }
    
    initAudio();
    
    const stickerElement = e.currentTarget;
    const stickerRect = stickerElement.getBoundingClientRect();
    
    const offsetX = e.clientX - stickerRect.left;
    const offsetY = e.clientY - stickerRect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    
    const newZIndex = nextZIndex;
    setNextZIndex(prev => prev + 1);
    
    const updatedSticker = { ...sticker, isDragging: true, zIndex: newZIndex };
    setDraggedSticker(updatedSticker);
    
    setPlacedStickers(prev => 
      prev.map(p => {
        if (p.id === sticker.id) {
          return updatedSticker;
        }
        return p;
      })
    );
    
    playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPeel.mp3');
  }, [nextZIndex, playSound, initAudio, cycleStickerSize]);

  useEffect(() => {
    if (!draggedSticker) return;

    const handleMouseMove = (e: MouseEvent) => {
      const absoluteX = e.clientX - dragOffset.x;
      const absoluteY = e.clientY - dragOffset.y;
      
      const percentX = (absoluteX / window.innerWidth) * 100;
      
      setPlacedStickers(prev =>
        prev.map(p =>
          p.id === draggedSticker.id
            ? { ...p, position: { x: percentX, y: absoluteY } }
            : p
        )
      );
    };

    const handleMouseUp = () => {
      if (draggedSticker) {
        playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPlace.mp3');
        onStickerMove?.(draggedSticker.id, draggedSticker.position);
        
        setPlacedStickers(prev =>
          prev.map(p => {
            if (p.id === draggedSticker.id) {
              return { ...p, isDragging: false };
            }
            return p;
          })
        );
      }
      setDraggedSticker(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSticker, dragOffset, playSound, onStickerMove]);

  const handleStickerTouchStart = useCallback((e: React.TouchEvent, sticker: PlacedSticker) => {
    e.preventDefault();
    
    if (e.touches.length > 1) {
      cycleStickerSize(sticker.id);
      return;
    }
    
    const touch = e.touches[0];
    const stickerElement = e.currentTarget;
    const stickerRect = stickerElement.getBoundingClientRect();
    
    const offsetX = touch.clientX - stickerRect.left;
    const offsetY = touch.clientY - stickerRect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    
    const updatedSticker = { ...sticker, isDragging: true };
    setDraggedSticker(updatedSticker);
    
    setPlacedStickers(prev => 
      prev.map(p => {
        if (p.id === sticker.id) {
          return updatedSticker;
        }
        return p;
      })
    );
    
    playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPeel.mp3');
  }, [playSound, cycleStickerSize]);

  useEffect(() => {
    if (!draggedSticker) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const absoluteX = touch.clientX - dragOffset.x;
      const absoluteY = touch.clientY - dragOffset.y;
      
      const percentX = (absoluteX / window.innerWidth) * 100;
      
      setPlacedStickers(prev =>
        prev.map(p =>
          p.id === draggedSticker.id
            ? { ...p, position: { x: percentX, y: absoluteY } }
            : p
        )
      );
    };

    const handleTouchEnd = () => {
      if (draggedSticker) {
        playSound('https://unpkg.com/shmoobium@latest/dist/assets/StickerPlace.mp3');
        onStickerMove?.(draggedSticker.id, draggedSticker.position);
        
        setPlacedStickers(prev =>
          prev.map(p => {
            if (p.id === draggedSticker.id) {
              return { ...p, isDragging: false };
            }
            return p;
          })
        );
      }
      setDraggedSticker(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedSticker, dragOffset, playSound, onStickerMove]);

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
          `sticker-box__placed-sticker--${sticker.size || 'medium'}`,
          sticker.isDragging && 'sticker-box__placed-sticker--dragging'
        )}
        style={{
          left: `${sticker.position.x}%`,
          top: `${sticker.position.y}px`,
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