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
  
  // Timeline state
  maxTracks: number;
  snapToGrid: boolean;
  snapToElements: boolean;
  
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
    
    // Track management
    setMaxTracks: (count: number) => void;
    getAvailableTrack: (preferredTrack?: number) => number;
    
    // Snap settings
    setSnapToGrid: (enabled: boolean) => void;
    setSnapToElements: (enabled: boolean) => void;
    
    // Utility
    reset: () => void;
  };
}

export const useVideoEditorStore = create<VideoEditorState>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTime: 0,
  duration: 30, // Start with 30 seconds minimum
  volume: 1,
  mediaFiles: [],
  timelineElements: [],
  selectedElementId: null,
  isFileLoaded: false,
  maxTracks: 8, // Start with 8 tracks
  snapToGrid: true,
  snapToElements: true,
  
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
    setDuration: (duration: number) => set({ duration: Math.max(duration, 30) }), // Minimum 30 seconds
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
        const newElements = [...state.timelineElements, element];
        const maxEndTime = Math.max(...newElements.map(el => el.startTime + el.duration));
        const newDuration = Math.max(state.duration, maxEndTime + 10); // Add 10 seconds buffer
        
        // Expand tracks if needed
        const maxTrack = Math.max(...newElements.map(el => el.track));
        const newMaxTracks = Math.max(state.maxTracks, maxTrack + 3); // Add buffer tracks
        
        return {
          timelineElements: newElements,
          duration: newDuration,
          maxTracks: newMaxTracks
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
        const newDuration = Math.max(state.duration, maxEndTime + 10);
        
        // Expand tracks if needed
        const maxTrack = Math.max(...updatedElements.map(el => el.track));
        const newMaxTracks = Math.max(state.maxTracks, maxTrack + 3);
        
        return {
          timelineElements: updatedElements,
          duration: newDuration,
          maxTracks: newMaxTracks
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
        const newDuration = Math.max(maxEndTime + 10, 30); // Minimum 30 seconds
        
        return {
          timelineElements: filteredElements,
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          duration: newDuration
        };
      });
    },
    
    setSelectedElement: (id: string | null) => set({ selectedElementId: id }),
    
    // Track management
    setMaxTracks: (count: number) => set({ maxTracks: Math.max(count, 4) }),
    
    getAvailableTrack: (preferredTrack?: number) => {
      const state = get();
      
      if (preferredTrack !== undefined) {
        // Check if preferred track has space at time 0
        const hasConflict = state.timelineElements.some(el => 
          el.track === preferredTrack && el.startTime < 5
        );
        if (!hasConflict) return preferredTrack;
      }
      
      // Find first available track
      for (let track = 0; track < state.maxTracks; track++) {
        const hasConflict = state.timelineElements.some(el => 
          el.track === track && el.startTime < 5
        );
        if (!hasConflict) return track;
      }
      
      // If no available track, expand and return new track
      const newTrack = state.maxTracks;
      set({ maxTracks: state.maxTracks + 1 });
      return newTrack;
    },
    
    // Snap settings
    setSnapToGrid: (enabled: boolean) => set({ snapToGrid: enabled }),
    setSnapToElements: (enabled: boolean) => set({ snapToElements: enabled }),
    
    // Utility
    reset: () => set({
      isPlaying: false,
      currentTime: 0,
      duration: 30,
      volume: 1,
      mediaFiles: [],
      timelineElements: [],
      selectedElementId: null,
      isFileLoaded: false,
      maxTracks: 8,
      snapToGrid: true,
      snapToElements: true
    })
  }
}));