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
import { useVideoEditorStore } from '@/lib/store/video-editor-store';
import { TimelineElement, SubtitleEntry } from '@/lib/store/video-editor-store.types';

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
            style={{
              ...commonProps.style,
              transform: `translate(${element.properties?.x || 0}px, ${element.properties?.y || 0}px) scale(${element.properties?.scale || 1}) rotate(${element.properties?.rotation || 0}deg)`,
              opacity: element.properties?.opacity || 1,
            }}
          />
        )}
        
        {element.type === 'text' && (
          <TextRenderer element={element} />
        )}

        {element.type === 'subtitle' && element.properties?.subtitleEntries && (
          <SubtitleRenderer
            subtitleEntries={element.properties.subtitleEntries}
            currentTime={elementCurrentTime}
            style={element.properties.subtitleStyle}
          />
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

interface TextRendererProps {
  element: TimelineElement;
}

const TextRenderer: React.FC<TextRendererProps> = ({ element }) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      padding: '20px',
      display: 'flex',
      justifyContent: element.properties?.alignment === 'left' ? 'flex-start' : 
                     element.properties?.alignment === 'right' ? 'flex-end' : 'center',
    };

    switch (element.properties?.position) {
      case 'top':
        return { ...baseStyles, top: 0, alignItems: 'flex-start' };
      case 'bottom':
        return { ...baseStyles, bottom: 0, alignItems: 'flex-end' };
      case 'center':
      default:
        return { ...baseStyles, top: '50%', transform: 'translateY(-50%)', alignItems: 'center' };
    }
  };

  return (
    <AbsoluteFill>
      <div style={getPositionStyles()}>
        <div
          style={{
            fontSize: `${element.properties?.fontSize || 48}px`,
            fontFamily: element.properties?.fontFamily || 'Arial',
            color: element.properties?.color || '#ffffff',
            backgroundColor: element.properties?.backgroundColor || 'transparent',
            padding: element.properties?.backgroundColor && element.properties.backgroundColor !== 'rgba(0, 0, 0, 0)' ? '8px 16px' : '0',
            borderRadius: element.properties?.backgroundColor && element.properties.backgroundColor !== 'rgba(0, 0, 0, 0)' ? '4px' : '0',
            textAlign: element.properties?.alignment || 'center',
            lineHeight: 1.2,
            maxWidth: '80%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Add text shadow for better readability
            transform: `translate(${element.properties?.x || 0}px, ${element.properties?.y || 0}px) scale(${element.properties?.scale || 1}) rotate(${element.properties?.rotation || 0}deg)`,
            opacity: element.properties?.opacity || 1,
          }}
        >
          {element.properties?.text || 'Sample Text'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

interface SubtitleRendererProps {
  subtitleEntries: SubtitleEntry[];
  currentTime: number;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    position?: 'bottom' | 'top' | 'center';
    alignment?: 'left' | 'center' | 'right';
  };
}

const SubtitleRenderer: React.FC<SubtitleRendererProps> = ({ 
  subtitleEntries, 
  currentTime, 
  style = {} 
}) => {
  // Find the current subtitle entry
  const currentSubtitle = subtitleEntries.find(entry => 
    currentTime >= entry.start && currentTime <= entry.end
  );

  if (!currentSubtitle) {
    return null;
  }

  const {
    fontSize = 24,
    fontFamily = 'Arial',
    color = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    position = 'bottom',
    alignment = 'center'
  } = style;

  // Calculate position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      padding: '20px',
      display: 'flex',
      justifyContent: alignment === 'left' ? 'flex-start' : 
                     alignment === 'right' ? 'flex-end' : 'center',
    };

    switch (position) {
      case 'top':
        return { ...baseStyles, top: 0, alignItems: 'flex-start' };
      case 'center':
        return { ...baseStyles, top: '50%', transform: 'translateY(-50%)', alignItems: 'center' };
      case 'bottom':
      default:
        return { ...baseStyles, bottom: 0, alignItems: 'flex-end' };
    }
  };

  return (
    <AbsoluteFill>
      <div style={getPositionStyles()}>
        <div
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            color,
            backgroundColor,
            padding: '8px 16px',
            borderRadius: '4px',
            textAlign: alignment,
            lineHeight: 1.2,
            maxWidth: '80%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {currentSubtitle.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};