import { TimelineElement } from '@/lib/store/video-editor-store.types';
import { Volume2, VolumeX, Type, Image, Video, Music } from 'lucide-react';
import * as React from 'react';

// Snapping configuration
const SNAP_THRESHOLD = 10; // pixels
const SNAP_TO_GRID = true; // snap to second intervals
const GRID_INTERVAL = 1; // seconds

/**
 * Calculates snap points from other elements and a grid.
 * @param duration The total duration of the timeline.
 * @param allElements All timeline elements to consider for snapping.
 * @param currentElementId The ID of the current element being dragged/resized, to exclude it from snap points.
 * @returns An array of sorted snap points in seconds.
 */
export const getSnapPoints = (duration: number, allElements: TimelineElement[], currentElementId: string) => {
  const snapPoints: number[] = [];
  
  // Add grid snap points (every second)
  if (SNAP_TO_GRID) {
    for (let i = 0; i <= Math.ceil(duration); i += GRID_INTERVAL) {
      snapPoints.push(i);
    }
  }
  
  // Add snap points from other elements (excluding current element)
  allElements.forEach(el => {
    if (el.id !== currentElementId) {
      snapPoints.push(el.startTime); // Start of other clips
      snapPoints.push(el.startTime + el.duration); // End of other clips
    }
  });
  
  return snapPoints.sort((a, b) => a - b);
};

/**
 * Finds the nearest snap point for a given time.
 * @param time The current time in seconds.
 * @param snapPoints An array of available snap points.
 * @param pixelsPerSecond The number of pixels representing one second on the timeline.
 * @returns The nearest snap point if within the SNAP_THRESHOLD, otherwise null.
 */
export const findNearestSnap = (time: number, snapPoints: number[], pixelsPerSecond: number) => {
  let nearestSnap = null;
  let minDistance = Infinity;
  
  snapPoints.forEach(snapPoint => {
    const distance = Math.abs(time - snapPoint);
    const pixelDistance = distance * pixelsPerSecond;
    
    if (pixelDistance <= SNAP_THRESHOLD && distance < minDistance) {
      minDistance = distance;
      nearestSnap = snapPoint;
    }
  });
  
  return nearestSnap;
};

/**
 * Returns the appropriate Tailwind CSS classes for a clip's background and border color based on its type.
 * @param elementType The type of the timeline element (e.g., 'video', 'audio', 'image', 'text').
 * @returns A string of Tailwind CSS classes.
 */
export const getClipColor = (elementType: TimelineElement['type']) => {
  switch (elementType) {
    case 'video':
      return 'bg-blue-500/80 border-blue-400 hover:bg-blue-500/90';
    case 'audio':
      return 'bg-green-500/80 border-green-400 hover:bg-green-500/90';
    case 'image':
      return 'bg-purple-500/80 border-purple-400 hover:bg-purple-500/90';
    case 'text':
      return 'bg-orange-500/80 border-orange-400 hover:bg-orange-500/90';
    default:
      return 'bg-gray-500/80 border-gray-400 hover:bg-gray-500/90';
  }
};

/**
 * Returns the appropriate Lucide React icon component for a clip's type.
 * @param elementType The type of the timeline element.
 * @returns A React icon component constructor.
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
      // Return a fallback icon for unknown types
      return Video;
  }
};

/**
 * Checks if a media type is compatible with a specific track.
 * @param mediaType The type of media being dropped.
 * @param trackNumber The track number where the media is being dropped.
 * @returns True if the media type is compatible with the track.
 */
export const isMediaTypeCompatibleWithTrack = (mediaType: string, trackNumber: number): boolean => {
  switch (trackNumber) {
    case 0: return mediaType === 'video';
    case 1: return mediaType === 'audio';
    case 2: return mediaType === 'text';
    case 3: return mediaType === 'image';
    default: return true; // Custom tracks accept any type
  }
};

/**
 * Gets the default track number for a given media type.
 * @param mediaType The type of media.
 * @returns The default track number for the media type.
 */
export const getDefaultTrackForMediaType = (mediaType: string): number => {
  switch (mediaType) {
    case 'video': return 0;
    case 'audio': return 1;
    case 'text': return 2;
    case 'image': return 3;
    default: return 0;
  }
};

/**
 * Checks for collisions between timeline elements.
 * @param newElement The new element being added.
 * @param existingElements Array of existing elements on the same track.
 * @returns True if there's a collision.
 */
export const hasTimelineCollision = (
  newElement: { startTime: number; duration: number },
  existingElements: TimelineElement[]
): boolean => {
  const newStart = newElement.startTime;
  const newEnd = newElement.startTime + newElement.duration;

  return existingElements.some(element => {
    const elementStart = element.startTime;
    const elementEnd = element.startTime + element.duration;
    
    return (
      (newStart >= elementStart && newStart < elementEnd) ||
      (newEnd > elementStart && newEnd <= elementEnd) ||
      (newStart <= elementStart && newEnd >= elementEnd)
    );
  });
};

/**
 * Calculates the optimal insertion position for a new element to avoid collisions.
 * @param trackElements Existing elements on the target track.
 * @param preferredStartTime The preferred start time for the new element.
 * @param duration The duration of the new element.
 * @returns The optimal start time that avoids collisions.
 */
export const findOptimalInsertionPosition = (
  trackElements: TimelineElement[],
  preferredStartTime: number,
  duration: number
): number => {
  if (trackElements.length === 0) {
    return Math.max(0, preferredStartTime);
  }

  // Sort elements by start time
  const sortedElements = [...trackElements].sort((a, b) => a.startTime - b.startTime);
  
  // Check if preferred position works
  if (!hasTimelineCollision({ startTime: preferredStartTime, duration }, trackElements)) {
    return Math.max(0, preferredStartTime);
  }

  // Find the first available gap
  let currentTime = 0;
  
  for (const element of sortedElements) {
    if (currentTime + duration <= element.startTime) {
      // Found a gap before this element
      return currentTime;
    }
    currentTime = Math.max(currentTime, element.startTime + element.duration);
  }
  
  // No gap found, place at the end
  return currentTime;
};