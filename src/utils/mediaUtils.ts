/**
 * Utility functions for handling media files in the video editor
 */

import { MediaFile, SubtitleEntry } from '@/lib/store/video-editor-store.types';

/**
 * Parses SRT file content and returns subtitle entries with duration
 */
export function parseSrtFile(file: File): Promise<{ subtitleEntries: SubtitleEntry[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const subtitleEntries = parseSrtContent(content);
        
        // Calculate total duration from the last subtitle entry
        const duration = subtitleEntries.length > 0 
          ? Math.max(...subtitleEntries.map(entry => entry.end))
          : 0;
        
        resolve({ subtitleEntries, duration });
      } catch (error) {
        reject(new Error(`Failed to parse SRT file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read SRT file'));
    };
    
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Parses SRT content string into subtitle entries
 */
function parseSrtContent(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split(/\n\s*\n/);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    
    const index = lines[0].trim();
    const timecode = lines[1].trim();
    const text = lines.slice(2).join('\n').trim();
    
    // Parse timecode (format: 00:00:00,000 --> 00:00:00,000)
    const timecodeMatch = timecode.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (!timecodeMatch) continue;
    
    const startTime = parseTimecode(timecodeMatch[1], timecodeMatch[2], timecodeMatch[3], timecodeMatch[4]);
    const endTime = parseTimecode(timecodeMatch[5], timecodeMatch[6], timecodeMatch[7], timecodeMatch[8]);
    
    entries.push({
      id: `subtitle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      start: startTime,
      end: endTime,
      text: text
    });
  }
  
  return entries.sort((a, b) => a.start - b.start);
}

/**
 * Converts timecode components to seconds
 */
function parseTimecode(hours: string, minutes: string, seconds: string, milliseconds: string): number {
  return parseInt(hours) * 3600 + 
         parseInt(minutes) * 60 + 
         parseInt(seconds) + 
         parseInt(milliseconds) / 1000;
}

/**
 * Converts seconds to SRT timecode format (HH:MM:SS,mmm)
 */
export function formatSrtTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Exports subtitle entries to SRT format
 */
export function exportToSrt(subtitleEntries: SubtitleEntry[]): string {
  return subtitleEntries
    .sort((a, b) => a.start - b.start)
    .map((entry, index) => {
      const startTimecode = formatSrtTimecode(entry.start);
      const endTimecode = formatSrtTimecode(entry.end);
      
      return `${index + 1}\n${startTimecode} --> ${endTimecode}\n${entry.text}\n`;
    })
    .join('\n');
}

/**
 * Creates a MediaFile object from a File
 */
export function createMediaFile(file: File): Promise<MediaFile> {
  return new Promise(async (resolve, reject) => {
    const url = URL.createObjectURL(file);
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mediaType = getMediaType(file);
    
    const mediaFile: MediaFile = {
      id,
      name: file.name,
      type: mediaType,
      url,
      file
    };

    try {
      // Handle subtitle files
      if (mediaType === 'subtitle') {
        const { subtitleEntries, duration } = await parseSrtFile(file);
        mediaFile.subtitleEntries = subtitleEntries;
        mediaFile.duration = duration;
        resolve(mediaFile);
        return;
      }

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
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a MediaFile object from an audio blob (e.g., from TTS generation)
 */
export function createMediaFileFromBlob(
  blob: Blob, 
  filename: string, 
  mimeType: string = 'audio/mpeg'
): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    // Create a File object from the blob
    const file = new File([blob], filename, { type: mimeType });
    const url = URL.createObjectURL(file);
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mediaFile: MediaFile = {
      id,
      name: filename,
      type: 'audio', // Always audio for TTS-generated content
      url,
      file
    };

    // Get duration for the audio file
    const audioElement = document.createElement('audio');
    audioElement.src = url;
    audioElement.preload = 'metadata';
    
    audioElement.onloadedmetadata = () => {
      mediaFile.duration = audioElement.duration;
      resolve(mediaFile);
    };
    
    audioElement.onerror = () => {
      reject(new Error('Failed to load generated audio metadata'));
    };
  });
}

/**
 * Determines the media type from a file
 */
export function getMediaType(file: File): 'video' | 'audio' | 'image' | 'subtitle' {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  
  // Check for subtitle files by extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'srt') return 'subtitle';
  
  // Fallback based on file extension
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
  
  // Check MIME type
  if (supportedTypes.includes(file.type)) return true;
  
  // Check file extension for subtitle files and other formats
  const extension = file.name.toLowerCase().split('.').pop();
  const supportedExtensions = [
    'mp4', 'webm', 'ogg', 'mov', 'avi', // video
    'mp3', 'wav', 'aac', 'm4a', // audio
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', // image
    'srt' // subtitle
  ];
  
  return supportedExtensions.includes(extension || '');
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