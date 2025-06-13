"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { Player as RemotionPlayer, PlayerRef, CallbackListener } from '@remotion/player';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { VideoComposition } from './VideoComposition';
import { MediaUploader } from './MediaUploader';

export default function VideoPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isFileLoaded,
    timelineElements,
    actions 
  } = useVideoEditorStore();

  // Calculate composition duration in frames (30 fps)
  const durationInFrames = Math.max(Math.floor(duration * 30), 30);

  // Sync player with store state
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;
    
    const targetFrame = Math.floor(currentTime * 30);
    playerRef.current.seekTo(targetFrame);
  }, [currentTime]);

  useEffect(() => {
    if (!playerRef.current) return;
    
    playerRef.current.setVolume(volume);
  }, [volume]);

  // Handle time updates from the player
  const handleTimeUpdate = useCallback<CallbackListener<'timeupdate'>>((e) => {
    const newTime = e.detail.frame / 30;
    actions.seek(newTime);
  }, [actions]);

  // Handle player events
  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    
    player.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [handleTimeUpdate]);

  // Show upload interface if no media is loaded
  if (!isFileLoaded || timelineElements.length === 0) {
    return (
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <MediaUploader />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-4xl max-h-[70vh] bg-black rounded-lg overflow-hidden shadow-lg">
        <RemotionPlayer
          ref={playerRef}
          component={VideoComposition}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
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
        />
      </div>
    </div>
  );
}