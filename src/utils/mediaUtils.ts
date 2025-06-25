/**
 * Utility functions for handling media files in the video editor
 */

import { MediaFile } from '@/lib/store/video-editor-store.types';

/**
 * Creates a MediaFile object from a File
 */
export function createMediaFile(file: File): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mediaFile: MediaFile = {
      id,
      name: file.name,
      type: getMediaType(file),
      url,
      file
    };

    // For video and audio files, get duration
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      const element = file.type.startsWith('video/') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      element.src = url;
      element.preload = 'metadata';
      
      element.onloadedmetadata = () => {
        mediaFile.duration = element.duration;
        resolve(mediaFile);
      };
      
      element.onerror = () => {
        reject(new Error(`Failed to load ${file.type.startsWith('video/') ? 'video' : 'audio'} metadata`));
      };
    } else {
      // For images, set a default duration
      mediaFile.duration = 5; // 5 seconds default for images
      resolve(mediaFile);
    }
  });
}

/**
 * Determines the media type from a file
 */
export function getMediaType(file: File): 'video' | 'audio' | 'image' {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  
  // Fallback based on file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension || '')) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension || '')) return 'audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
  
  return 'video'; // Default fallback
}

/**
 * Validates if a file is a supported media type
 */
export function isValidMediaFile(file: File): boolean {
  const supportedTypes = [
    // Video types
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    // Audio types
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4',
    // Image types
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ];
  
  return supportedTypes.includes(file.type) || 
         supportedTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]));
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}