import { create } from 'zustand';

export interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration?: number;
  file: File;
}

export interface TimelineElement {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  startTime: number;
  duration: number;
  track: number;
  mediaFile?: MediaFile;
  properties?: {
    // Common properties
    volume?: number; // For audio/video
    x?: number; // For image/text/video position
    y?: number; // For image/text/video position
    
    // Text specific
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;

    // Video specific
    resolution?: string;
    playbackSpeed?: number;

    // Image specific
    displayDuration?: number; // For images
  };
}

export interface VideoEditorState {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Media and timeline
  mediaFiles: MediaFile[];
  timelineElements: TimelineElement[];
  selectedElementId: string | null;
  
  // UI state
  isFileLoaded: boolean;
  
  // Actions
  actions: {
    // Playback controls
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    
    // Media management
    addMediaFile: (file: MediaFile) => void;
    removeMediaFile: (id: string) => void;
    setIsFileLoaded: (loaded: boolean) => void;
    
    // Timeline management
    addTimelineElement: (element: TimelineElement) => void;
    updateTimelineElement: (id: string, updates: Partial<TimelineElement>) => void;
    removeTimelineElement: (id: string) => void;
    setSelectedElement: (id: string | null) => void;
    
    // Utility
    reset: () => void;
  };
}

export const useVideoEditorStore = create<VideoEditorState>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  mediaFiles: [],
  timelineElements: [],
  selectedElementId: null,
  isFileLoaded: false,
  
  actions: {
    // Playback controls
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    seek: (time: number) => {
      const state = get();
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      set({ currentTime: clampedTime });
    },
    setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setDuration: (duration: number) => set({ duration }),
    setCurrentTime: (time: number) => {
      const state = get();
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      set({ currentTime: clampedTime });
    },
    
    // Media management
    addMediaFile: (file: MediaFile) => {
      set(state => ({
        mediaFiles: [...state.mediaFiles, file],
        isFileLoaded: true
      }));
    },
    
    removeMediaFile: (id: string) => {
      set(state => ({
        mediaFiles: state.mediaFiles.filter(f => f.id !== id),
        timelineElements: state.timelineElements.filter(e => e.mediaFile?.id !== id),
        isFileLoaded: state.mediaFiles.length > 1
      }));
    },
    
    setIsFileLoaded: (loaded: boolean) => set({ isFileLoaded: loaded }),
    
    // Timeline management
    addTimelineElement: (element: TimelineElement) => {
      set(state => {
        // Determine the highest existing track number
        const maxTrack = state.timelineElements.reduce((max, el) => Math.max(max, el.track), -1);
        const newTrackNumber = maxTrack + 1;

        // Assign a track number if not already provided
        const elementWithTrack = {
          ...element,
          track: element.track !== undefined ? element.track : newTrackNumber,
          // Set default properties based on type if not provided
          properties: {
            ...element.properties,
            ...(element.type === 'audio' && { volume: element.properties?.volume ?? 1 }),
            ...(element.type === 'video' && { volume: element.properties?.volume ?? 1, resolution: element.properties?.resolution ?? '1080p', playbackSpeed: element.properties?.playbackSpeed ?? 1 }),
            ...(element.type === 'image' && { displayDuration: element.properties?.displayDuration ?? 5 }),
            ...(element.type === 'text' && { text: element.properties?.text ?? 'New Text', fontSize: element.properties?.fontSize ?? 24, fontFamily: element.properties?.fontFamily ?? 'Arial', color: element.properties?.color ?? '#ffffff' }),
          }
        };

        const newElements = [...state.timelineElements, elementWithTrack];
        const maxEndTime = Math.max(...newElements.map(el => el.startTime + el.duration));
        return {
          timelineElements: newElements,
          duration: Math.max(state.duration, maxEndTime)
        };
      });
    },
    
    updateTimelineElement: (id: string, updates: Partial<TimelineElement>) => {
      set(state => {
        const updatedElements = state.timelineElements.map(el =>
          el.id === id ? { ...el, ...updates } : el
        );
        
        // Recalculate total duration based on all elements
        const maxEndTime = Math.max(...updatedElements.map(el => el.startTime + el.duration));
        
        return {
          timelineElements: updatedElements,
          duration: Math.max(state.duration, maxEndTime)
        };
      });
    },
    
    removeTimelineElement: (id: string) => {
      set(state => {
        const filteredElements = state.timelineElements.filter(el => el.id !== id);
        
        // Recalculate duration after removal
        const maxEndTime = filteredElements.length > 0 
          ? Math.max(...filteredElements.map(el => el.startTime + el.duration))
          : 0;
        
        return {
          timelineElements: filteredElements,
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          duration: maxEndTime
        };
      });
    },
    
    setSelectedElement: (id: string | null) => set({ selectedElementId: id }),
    
    // Utility
    reset: () => set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      mediaFiles: [],
      timelineElements: [],
      selectedElementId: null,
      isFileLoaded: false
    })
  }
}));
