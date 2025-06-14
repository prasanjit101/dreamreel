"use client";

import React, { useRef, useEffect, useState } from 'react'; // Added useState
import { Player as RemotionPlayer, PlayerRef, CallbackListener } from '@remotion/player';
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { VideoComposition } from './VideoComposition';
import { MediaUploader } from './MediaUploader';

export default function VideoPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false); // New state for player readiness

  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isFileLoaded,
    timelineElements,
    actions 
  } = useVideoEditorStore();

  // Callback ref to ensure playerRef is set and state is updated
  const setPlayerRef = (instance: PlayerRef | null) => {
    playerRef.current = instance;
    setIsPlayerReady(!!instance); // Set true if instance is not null
  };

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
    const currentFrame = playerRef.current.getCurrentFrame();
    
    // Only seek if there's a significant difference to avoid infinite loops
    if (Math.abs(targetFrame - currentFrame) > 1) {
      playerRef.current.seekTo(targetFrame);
    }
  }, [currentTime]);

  useEffect(() => {
    if (!playerRef.current) return;
    
    playerRef.current.setVolume(volume);
  }, [volume]);

  // Handle player events - now dependent on isPlayerReady
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) {
      return;
    }

    const player = playerRef.current;

    const handleTimeUpdate: CallbackListener<'timeupdate'> = (e) => {
      const newTime = e.detail.frame / 30;
      actions.setCurrentTime(newTime);
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
    
    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    
    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
    };
  }, [isPlayerReady, actions]); // Changed dependencies to isPlayerReady and actions

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
          ref={setPlayerRef} // Use the callback ref here
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
          loop={false}
        />
      </div>
    </div>
  );
}
