import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getFrameUrl } from './animationConfig';

/**
 * ScrollCanvas renders scroll-scrubbed image sequences on HTML Canvas.
 * Uses requestAnimationFrame, image preloading with decode(), DPR scaling,
 * reverse scroll scrubbing, and graceful fallback.
 */
const ScrollCanvas = ({
  config,
  progress = 0, // Controlled progress 0 to 1
  overlayContent = null,
  containerHeight = '250vh',
  className = '',
  stickyOffset = 'top-0'
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const currentFrameRef = useRef(-1);
  const animFrameIdRef = useRef(null);

  const { frameCount } = config;

  // 1. Preload and decode images
  useEffect(() => {
    let isCancelled = false;
    const images = new Array(frameCount);
    let loaded = 0;

    const loadSingleImage = (index) => {
      const img = new Image();
      const primaryUrl = getFrameUrl(config, index, true);
      const fallbackUrl = getFrameUrl(config, index, false);

      img.src = primaryUrl;

      const handleSuccess = () => {
        if (isCancelled) return;
        images[index] = img;
        loaded++;
        setLoadedCount(loaded);
        if (loaded === frameCount) {
          imagesRef.current = images;
          setIsLoaded(true);
        }
      };

      const handleFailure = () => {
        // Try fallback JPG
        const fallbackImg = new Image();
        fallbackImg.src = fallbackUrl;
        fallbackImg.onload = () => {
          if (isCancelled) return;
          images[index] = fallbackImg;
          loaded++;
          setLoadedCount(loaded);
          if (loaded === frameCount) {
            imagesRef.current = images;
            setIsLoaded(true);
          }
        };
        fallbackImg.onerror = () => {
          if (isCancelled) return;
          console.warn(`Frame ${index} failed to load from ${primaryUrl} and fallback.`);
          loaded++;
          setLoadedCount(loaded);
          if (loaded === frameCount) {
            imagesRef.current = images;
            setIsLoaded(true);
          }
        };
      };

      if ('decode' in img) {
        img.decode()
          .then(handleSuccess)
          .catch(() => {
            img.onload = handleSuccess;
            img.onerror = handleFailure;
          });
      } else {
        img.onload = handleSuccess;
        img.onerror = handleFailure;
      }
    };

    for (let i = 0; i < frameCount; i++) {
      loadSingleImage(i);
    }

    return () => {
      isCancelled = true;
    };
  }, [config, frameCount]);

  // 2. Scroll listener to calculate progress within the container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // When top of container hits top of viewport (or stickyOffset)
      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setInternalProgress(rawProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Use either external progress prop or internally calculated scroll progress
  const activeProgress = progress !== undefined && progress !== null && progress > 0 ? progress : internalProgress;

  // 3. Canvas rendering with DPR and smooth drawing
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img) return;

    const dpr = Math.min(window.devicePixelRatio || 1, config.quality?.maxDpr || 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Adjust canvas resolution if size changed
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Maintain aspect ratio: contain or cover
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = displayWidth / displayHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image
      drawHeight = displayHeight;
      drawWidth = displayHeight * imgAspect;
      offsetX = (displayWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Canvas is taller than image
      drawWidth = displayWidth;
      drawHeight = displayWidth / imgAspect;
      offsetX = 0;
      offsetY = (displayHeight - drawHeight) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    currentFrameRef.current = frameIndex;
  }, [config]);

  // 4. Animation loop tied to scroll progress
  useEffect(() => {
    if (!isLoaded || imagesRef.current.length === 0) return;

    const targetFrame = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(activeProgress * (frameCount - 1)))
    );

    if (targetFrame !== currentFrameRef.current) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      animFrameIdRef.current = requestAnimationFrame(() => {
        renderFrame(targetFrame);
      });
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [activeProgress, isLoaded, frameCount, renderFrame]);

  // Initial draw once loaded
  useEffect(() => {
    if (isLoaded) {
      renderFrame(0);
    }
  }, [isLoaded, renderFrame]);

  const loadPercent = Math.round((loadedCount / frameCount) * 100);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight }}
      className={`relative w-full ${className}`}
    >
      <div className={`sticky ${stickyOffset} w-full h-screen overflow-hidden flex items-center justify-center`}>
        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-charcoal-950/90 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full border-4 border-charcoal-700 border-t-brand-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-charcoal-300 tracking-wider uppercase">
              Loading RouteMate Cinema ({loadPercent}%)
            </p>
            <div className="w-48 h-1.5 bg-charcoal-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-150 rounded-full"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Animation Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none transition-opacity duration-300"
          style={{ opacity: isLoaded ? 1 : 0 }}
        />

        {/* Ambient emerald backlight glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-brand-500/10 via-transparent to-transparent opacity-60" />

        {/* Overlay Content (Titles, Steps, Badges) */}
        {overlayContent && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-20">
            {typeof overlayContent === 'function' ? overlayContent(activeProgress) : overlayContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollCanvas;

