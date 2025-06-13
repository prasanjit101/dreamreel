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
    volume?: number;
    text?: string;
    fontSize?: number;
    color?: string;
    x?: number;
    y?: number;
  };
}

interface VideoEditorState {
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
    seek: (time: number) => set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),
    setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setDuration: (duration: number) => set({ duration }),
    
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
      set(state => ({
        timelineElements: [...state.timelineElements, element],
        duration: Math.max(state.duration, element.startTime + element.duration)
      }));
    },
    
    updateTimelineElement: (id: string, updates: Partial<TimelineElement>) => {
      set(state => ({
        timelineElements: state.timelineElements.map(el =>
          el.id === id ? { ...el, ...updates } : el
        )
      }));
    },
    
    removeTimelineElement: (id: string) => {
      set(state => ({
        timelineElements: state.timelineElements.filter(el => el.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      }));
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