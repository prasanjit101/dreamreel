import { create } from 'zustand';
import { VideoEditorState, MediaFile, SidebarTab } from './video-editor-store.types';
import { TimelineElement } from '@/lib/store/video-editor-store.types';


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
  activeSidebarTab: 'files',
  aspectRatio: '16:9', // Default aspect ratio
  
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
            ...(element.type === 'subtitle' && { 
              subtitleEntries: element.properties?.subtitleEntries ?? [],
              subtitleStyle: element.properties?.subtitleStyle ?? {
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                position: 'bottom',
                alignment: 'center'
              }
            }),
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
    
    // Project settings
    setAspectRatio: (aspectRatio: string) => set({ aspectRatio }),
    
    // UI management
    setActiveSidebarTab: (tab: SidebarTab) => set({ activeSidebarTab: tab }),
    
    // Utility
    reset: () => set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      mediaFiles: [],
      timelineElements: [],
      selectedElementId: null,
      isFileLoaded: false,
      activeSidebarTab: 'files',
      aspectRatio: '16:9' // Reset to default aspect ratio
    })
  }
}));