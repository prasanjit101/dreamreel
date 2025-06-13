"use client";

import { Player as RemotionPlayer, PlayerRef, CallbackListener } from "@remotion/player";
import { useRef, useEffect } from "react";
import { useVideoEditorStore } from "@/lib/store/video-editor-store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Placeholder for your actual video component
// You will replace this with your Remotion composition component later
const YourVideoComponent = () => {
  return (
    <div style={{ flex: 1, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <p>Your Remotion Video Composition Here</p>
    </div>
  );
};

export function Player() {
  const playerRef = useRef<PlayerRef>(null);
  const { isPlaying, currentTime, duration, volume, isFileLoaded, actions } = useVideoEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(currentTime);
    }
  }, [currentTime]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    const onTimeUpdate: CallbackListener<'timeupdate'> = (e) => {
      actions.seek(e.detail.frame / 30);
    };

    playerRef.current.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
  }, [actions]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // In a real application, you would process the file here
      // For now, we just set isFileLoaded to true
      actions.setIsFileLoaded(true);
      // You might also want to set the duration based on the loaded video
      // actions.setDuration(someCalculatedDuration);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 bg-muted/30 flex items-center justify-center">
      {!isFileLoaded ? (
        <div className="text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*" // Accept video files
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto border-2 border-dashed border-border text-muted-foreground hover:text-foreground"
            onClick={handleButtonClick}
          >
            <Plus className="w-8 h-8" />
          </Button>
          <div className="space-y-2">
            <h3 className="text-foreground font-medium">Click to upload a file</h3>
          </div>
        </div>
      ) : (
        <RemotionPlayer
          ref={playerRef}
          component={YourVideoComponent} // Replace with actual video component
          durationInFrames={duration * 30} // Assuming 30fps
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
