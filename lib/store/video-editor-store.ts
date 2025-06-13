import { create, StoreApi } from 'zustand';

type VideoEditorState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFileLoaded: boolean; // New state for file loading
  actions: {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setDuration: (duration: number) => void;
    setIsFileLoaded: (loaded: boolean) => void; // New action
  };
};

export const useVideoEditorStore = create<VideoEditorState>((set: StoreApi<VideoEditorState>['setState']) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 1,
  volume: 1,
  isFileLoaded: false, // Initial state
  actions: {
    play: () => set((state: VideoEditorState) => ({ ...state, isPlaying: true })),
    pause: () => set((state: VideoEditorState) => ({ ...state, isPlaying: false })),
    seek: (time: number) => set((state: VideoEditorState) => ({ ...state, currentTime: time })),
    setVolume: (volume: number) => set((state: VideoEditorState) => ({ ...state, volume })),
    setDuration: (duration: number) => set((state: VideoEditorState) => ({ ...state, duration })),
    setIsFileLoaded: (loaded: boolean) => set((state: VideoEditorState) => ({ ...state, isFileLoaded: loaded })), // New action
  },
}));
