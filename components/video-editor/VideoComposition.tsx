"use client";

import React from 'react';
import { 
  AbsoluteFill, 
  OffthreadVideo, 
  Audio, 
  Img, 
  useCurrentFrame, 
  useVideoConfig,
  Sequence
} from 'remotion';
import { useVideoEditorStore, TimelineElement } from '@/lib/store/video-editor-store';

interface VideoCompositionProps {
  // Props can be passed from the player if needed
}

export const VideoComposition: React.FC<VideoCompositionProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { timelineElements } = useVideoEditorStore();
  
  const currentTime = frame / fps;

  // Filter elements that should be visible at the current time
  const visibleElements = timelineElements.filter(element => {
    const elementStart = element.startTime;
    const elementEnd = element.startTime + element.duration;
    return currentTime >= elementStart && currentTime < elementEnd;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {visibleElements.map((element) => (
        <ElementRenderer
          key={element.id}
          element={element}
          currentTime={currentTime}
        />
      ))}
    </AbsoluteFill>
  );
};

interface ElementRendererProps {
  element: TimelineElement;
  currentTime: number;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, currentTime }) => {
  const { fps } = useVideoConfig();
  const elementCurrentTime = currentTime - element.startTime;
  const startFrame = Math.floor(element.startTime * fps);
  const durationInFrames = Math.floor(element.duration * fps);

  const commonProps = {
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
    }
  };

  return (
    <Sequence from={startFrame} durationInFrames={durationInFrames}>
      <AbsoluteFill>
        {element.type === 'video' && element.mediaFile && (
          <OffthreadVideo
            src={element.mediaFile.url}
            volume={element.properties?.volume || 1}
            {...commonProps}
          />
        )}
        
        {element.type === 'audio' && element.mediaFile && (
          <Audio
            src={element.mediaFile.url}
            volume={element.properties?.volume || 1}
          />
        )}
        
        {element.type === 'image' && element.mediaFile && (
          <Img
            src={element.mediaFile.url}
            {...commonProps}
          />
        )}
        
        {element.type === 'text' && (
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: element.properties?.fontSize || 48,
              color: element.properties?.color || '#ffffff',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            {element.properties?.text || 'Sample Text'}
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Sequence>
  );
};