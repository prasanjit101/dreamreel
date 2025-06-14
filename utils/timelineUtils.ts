import { TimelineElement } from '@/lib/store/video-editor-store';
import { Volume2, VolumeX, Type, Image, Video, Music } from 'lucide-react';
import * as React from 'react';

// Enhanced snapping configuration
const SNAP_THRESHOLD = 15; // pixels - increased for better UX
const GRID_INTERVAL = 1; // seconds

/**
 * Calculates comprehensive snap points from grid, other elements, and timeline markers.
 */
export const getSnapPoints = (
  duration: number, 
  allElements: TimelineElement[], 
  currentElementId: string,
  snapToGrid: boolean = true,
  snapToElements: boolean = true
) => {
  const snapPoints: number[] = [];
  
  // Add grid snap points (every second)
  if (snapToGrid) {
    for (let i = 0; i <= Math.ceil(duration); i += GRID_INTERVAL) {
      snapPoints.push(i);
    }
    
    // Add half-second grid points for finer control
    for (let i = 0.5; i <= Math.ceil(duration); i += GRID_INTERVAL) {
      snapPoints.push(i);
    }
  }
  
  // Add snap points from other elements
  if (snapToElements) {
    allElements.forEach(el => {
      if (el.id !== currentElementId) {
        snapPoints.push(el.startTime); // Start of other clips
        snapPoints.push(el.startTime + el.duration); // End of other clips
        
        // Add midpoint for additional snapping
        snapPoints.push(el.startTime + el.duration / 2);
      }
    });
  }
  
  // Add timeline markers (0, duration)
  snapPoints.push(0);
  snapPoints.push(duration);
  
  // Remove duplicates and sort
  return [...new Set(snapPoints)].sort((a, b) => a - b);
};

/**
 * Enhanced snap detection with visual feedback.
 */
export const findNearestSnap = (
  time: number, 
  snapPoints: number[], 
  pixelsPerSecond: number,
  threshold: number = SNAP_THRESHOLD
) => {
  let nearestSnap = null;
  let minDistance = Infinity;
  
  snapPoints.forEach(snapPoint => {
    const distance = Math.abs(time - snapPoint);
    const pixelDistance = distance * pixelsPerSecond;
    
    if (pixelDistance <= threshold && distance < minDistance) {
      minDistance = distance;
      nearestSnap = snapPoint;
    }
  });
  
  return nearestSnap;
};

/**
 * Checks for collisions between timeline elements on the same track.
 */
export const checkCollision = (
  element: TimelineElement,
  newStartTime: number,
  newDuration: number,
  allElements: TimelineElement[]
): boolean => {
  const newEndTime = newStartTime + newDuration;
  
  return allElements.some(el => 
    el.id !== element.id && 
    el.track === element.track &&
    newStartTime < el.startTime + el.duration &&
    newEndTime > el.startTime
  );
};

/**
 * Finds the nearest valid position without collisions.
 */
export const findValidPosition = (
  element: TimelineElement,
  targetStartTime: number,
  allElements: TimelineElement[],
  duration: number
): number => {
  const elementDuration = element.duration;
  
  // Try the target position first
  if (!checkCollision(element, targetStartTime, elementDuration, allElements)) {
    return Math.max(0, Math.min(targetStartTime, duration - elementDuration));
  }
  
  // Find elements on the same track
  const sameTrackElements = allElements
    .filter(el => el.id !== element.id && el.track === element.track)
    .sort((a, b) => a.startTime - b.startTime);
  
  // Try to place before the first element
  if (sameTrackElements.length > 0 && targetStartTime < sameTrackElements[0].startTime) {
    const maxStart = sameTrackElements[0].startTime - elementDuration;
    if (maxStart >= 0) {
      return maxStart;
    }
  }
  
  // Try to place between elements
  for (let i = 0; i < sameTrackElements.length - 1; i++) {
    const current = sameTrackElements[i];
    const next = sameTrackElements[i + 1];
    const gapStart = current.startTime + current.duration;
    const gapEnd = next.startTime;
    
    if (gapEnd - gapStart >= elementDuration) {
      if (targetStartTime >= gapStart && targetStartTime + elementDuration <= gapEnd) {
        return targetStartTime;
      }
      return gapStart;
    }
  }
  
  // Try to place after the last element
  if (sameTrackElements.length > 0) {
    const lastElement = sameTrackElements[sameTrackElements.length - 1];
    const afterLast = lastElement.startTime + lastElement.duration;
    if (afterLast + elementDuration <= duration) {
      return afterLast;
    }
  }
  
  // Fallback to original position if no valid position found
  return element.startTime;
};

/**
 * Enhanced clip color system with better contrast and visual hierarchy.
 */
export const getClipColor = (elementType: TimelineElement['type']) => {
  switch (elementType) {
    case 'video':
      return 'bg-blue-600/90 border-blue-400 hover:bg-blue-600 shadow-blue-500/20';
    case 'audio':
      return 'bg-green-600/90 border-green-400 hover:bg-green-600 shadow-green-500/20';
    case 'image':
      return 'bg-purple-600/90 border-purple-400 hover:bg-purple-600 shadow-purple-500/20';
    case 'text':
      return 'bg-orange-600/90 border-orange-400 hover:bg-orange-600 shadow-orange-500/20';
    default:
      return 'bg-gray-600/90 border-gray-400 hover:bg-gray-600 shadow-gray-500/20';
  }
};

/**
 * Returns the appropriate Lucide React icon component for a clip's type.
 */
export const getClipIcon = (elementType: TimelineElement['type']) => {
  switch (elementType) {
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'image':
      return Image;
    case 'text':
      return Type;
    default:
      return Video;
  }
};

/**
 * Gets the default track for a media type.
 */
export const getDefaultTrack = (mediaType: 'video' | 'audio' | 'image' | 'text'): number => {
  switch (mediaType) {
    case 'video':
      return 0;
    case 'audio':
      return 1;
    case 'text':
      return 2;
    case 'image':
      return 3;
    default:
      return 0;
  }
};

/**
 * Gets a human-readable track label.
 */
export const getTrackLabel = (trackNumber: number): string => {
  switch (trackNumber) {
    case 0: return 'Video';
    case 1: return 'Audio';
    case 2: return 'Text';
    case 3: return 'Image';
    default: return `Track ${trackNumber + 1}`;
  }
};

/**
 * Calculates the optimal zoom level based on timeline content.
 */
export const calculateOptimalZoom = (duration: number, containerWidth: number): number => {
  const targetPixelsPerSecond = containerWidth / duration;
  const baseZoom = targetPixelsPerSecond / 50; // 50 is the base pixels per second
  return Math.max(0.1, Math.min(5, baseZoom));
};