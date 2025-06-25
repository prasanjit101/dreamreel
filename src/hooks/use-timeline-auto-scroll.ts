"use client";

import { useCallback, useRef, useEffect } from 'react';

interface UseTimelineAutoScrollProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isActive: boolean;
  scrollSpeed?: number;
  edgeThreshold?: number;
}

interface UseTimelineAutoScrollReturn {
  handleMouseMove: (event: MouseEvent) => void;
  stopAutoScroll: () => void;
}

/**
 * Custom hook for implementing smooth auto-scrolling during drag operations
 * Follows professional video editor behavior patterns
 */
export const useTimelineAutoScroll = ({
  containerRef,
  isActive,
  scrollSpeed = 2,
  edgeThreshold = 50
}: UseTimelineAutoScrollProps): UseTimelineAutoScrollReturn => {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const scrollDirectionRef = useRef<'left' | 'right' | null>(null);
  const scrollSpeedRef = useRef<number>(0);

  const performScroll = useCallback(() => {
    if (!containerRef.current || !scrollDirectionRef.current) return;

    const container = containerRef.current;
    const currentScrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (scrollDirectionRef.current === 'left' && currentScrollLeft > 0) {
      container.scrollLeft = Math.max(0, currentScrollLeft - scrollSpeedRef.current);
    } else if (scrollDirectionRef.current === 'right' && currentScrollLeft < maxScrollLeft) {
      container.scrollLeft = Math.min(maxScrollLeft, currentScrollLeft + scrollSpeedRef.current);
    }

    if (scrollDirectionRef.current) {
      animationFrameRef.current = requestAnimationFrame(performScroll);
    }
  }, [containerRef]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = rect.width;

    // Calculate distance from edges
    const leftDistance = mouseX;
    const rightDistance = containerWidth - mouseX;

    // Determine if we should scroll and in which direction
    let shouldScroll = false;
    let direction: 'left' | 'right' | null = null;
    let speed = 0;

    if (leftDistance < edgeThreshold && leftDistance >= 0) {
      // Near left edge - scroll left
      shouldScroll = true;
      direction = 'left';
      // Speed increases as we get closer to the edge
      speed = scrollSpeed * (1 - leftDistance / edgeThreshold) * 3;
    } else if (rightDistance < edgeThreshold && rightDistance >= 0) {
      // Near right edge - scroll right
      shouldScroll = true;
      direction = 'right';
      // Speed increases as we get closer to the edge
      speed = scrollSpeed * (1 - rightDistance / edgeThreshold) * 3;
    }

    // Update scroll state
    if (shouldScroll && direction) {
      if (scrollDirectionRef.current !== direction) {
        // Direction changed or started scrolling
        scrollDirectionRef.current = direction;
        scrollSpeedRef.current = Math.max(1, speed);
        
        // Cancel any existing animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Start new scroll animation
        animationFrameRef.current = requestAnimationFrame(performScroll);
      } else {
        // Update speed for existing direction
        scrollSpeedRef.current = Math.max(1, speed);
      }
    } else {
      // Stop scrolling
      stopAutoScroll();
    }
  }, [isActive, containerRef, edgeThreshold, scrollSpeed, performScroll]);

  const stopAutoScroll = useCallback(() => {
    scrollDirectionRef.current = null;
    scrollSpeedRef.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // Cleanup on unmount or when inactive
  useEffect(() => {
    if (!isActive) {
      stopAutoScroll();
    }
    
    return () => {
      stopAutoScroll();
    };
  }, [isActive, stopAutoScroll]);

  return {
    handleMouseMove,
    stopAutoScroll
  };
};