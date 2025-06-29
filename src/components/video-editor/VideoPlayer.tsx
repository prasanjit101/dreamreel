"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Player as RemotionPlayer, PlayerRef, CallbackListener } from '@remotion/player';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { VideoComposition } from './VideoComposition';
import { MediaUploader } from './MediaUploader';

/**
 * Calculates composition dimensions based on aspect ratio
 * Maintains a maximum dimension while preserving aspect ratio
 */
function calculateCompositionDimensions(aspectRatio: string): { width: number; height: number } {
  const maxDimension = 1920; // Maximum width or height
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  
  if (!widthRatio || !heightRatio) {
    // Fallback to 16:9 if aspect ratio is invalid
    return { width: 1920, height: 1080 };
  }
  
  const ratio = widthRatio / heightRatio;
  
  if (ratio >= 1) {
    // Landscape or square - limit by width
    const width = maxDimension;
    const height = Math.round(width / ratio);
    return { width, height };
  } else {
    // Portrait - limit by height
    const height = maxDimension;
    const width = Math.round(height * ratio);
    return { width, height };
  }
}

export default function VideoPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isFileLoaded,
    timelineElements,
    aspectRatio,
    actions 
  } = useVideoEditorStore();

  // Callback ref to ensure playerRef is set and state is updated
  const setPlayerRef = (instance: PlayerRef | null) => {
    playerRef.current = instance;
    setIsPlayerReady(!!instance);
  };

  // Calculate composition dimensions based on aspect ratio
  const { width: compositionWidth, height: compositionHeight } = calculateCompositionDimensions(aspectRatio);

  // Calculate composition duration in frames (30 fps)
  const durationInFrames = Math.max(Math.floor(duration * 30), 30);

  // Sync player with store state - improved synchronization
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying, isPlayerReady]);

  // Improved seek synchronization
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    
    const targetFrame = Math.floor(currentTime * 30);
    const currentFrame = playerRef.current.getCurrentFrame();
    
    // Only seek if there's a significant difference and enough time has passed
    const timeDiff = Math.abs(targetFrame - currentFrame);
    const timeSinceLastSync = Date.now() - lastSyncTime;
    
    if (timeDiff > 2 && timeSinceLastSync > 100) {
      playerRef.current.seekTo(targetFrame);
      setLastSyncTime(Date.now());
    }
  }, [currentTime, isPlayerReady, lastSyncTime]);

  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    
    playerRef.current.setVolume(volume);
  }, [volume, isPlayerReady]);

  // Handle player events with improved debouncing
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) {
      return;
    }

    const player = playerRef.current;
    let timeUpdateTimeout: NodeJS.Timeout;

    const handleTimeUpdate: CallbackListener<'timeupdate'> = (e) => {
      // Debounce time updates to prevent excessive state updates
      clearTimeout(timeUpdateTimeout);
      timeUpdateTimeout = setTimeout(() => {
        const newTime = e.detail.frame / 30;
        // Only update if the difference is significant
        if (Math.abs(newTime - currentTime) > 0.1) {
          actions.setCurrentTime(newTime);
        }
      }, 50);
    };

    const handlePlay: CallbackListener<'play'> = () => {
      actions.play();
    };

    const handlePause: CallbackListener<'pause'> = () => {
      actions.pause();
    };

    const handleEnded: CallbackListener<'ended'> = () => {
      actions.pause();
      actions.seek(0);
    };

    const handleSeeked: CallbackListener<'seeked'> = (e) => {
      const newTime = e.detail.frame / 30;
      actions.setCurrentTime(newTime);
    };
    
    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    player.addEventListener('seeked', handleSeeked);
    
    return () => {
      clearTimeout(timeUpdateTimeout);
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
      player.removeEventListener('seeked', handleSeeked);
    };
  }, [isPlayerReady, actions, currentTime]);

  // Show upload interface if no media is loaded
  if (!isFileLoaded) {
    return (
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <MediaUploader />
      </div>
    );
  }

  // Show player interface even if no timeline elements exist
  // This allows users to see the player area after importing files
  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-4xl max-h-[70vh] bg-black rounded-lg overflow-hidden shadow-lg">
        {timelineElements.length > 0 ? (
          <RemotionPlayer
            ref={setPlayerRef}
            component={VideoComposition}
            durationInFrames={durationInFrames}
            compositionWidth={compositionWidth}
            compositionHeight={compositionHeight}
            fps={30}
            style={{ 
              width: '100%', 
              height: '100%',
              borderRadius: '8px'
            }}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={true}
            spaceKeyToPlayOrPause={false}
            loop={false}
            allowFullscreen={true}
            showVolumeControls={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center space-y-4">
              <div className="text-lg font-medium">Player Ready</div>
              <div className="text-sm text-white/70">
                Add media files to the timeline to start editing
              </div>
              <div className="text-xs text-white/50">
                Current aspect ratio: {aspectRatio} ({compositionWidth}×{compositionHeight})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}