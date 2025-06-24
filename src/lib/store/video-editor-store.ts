import { create } from 'zustand';
import { createId } from '@paralleldrive/cuid2';

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

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  timelineElements: TimelineElement[];
  mediaFiles: MediaFile[];
}

export type SidebarTab = 'files' | 'tracks';

export interface VideoEditorState {
  // Project state
  projectId: string | null;
  projectName: string | null;
  isProjectLoaded: boolean;
  
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
  activeSidebarTab: SidebarTab;
  
  // Actions
  actions: {
    // Project management
    newProject: (name: string) => void;
    saveProject: () => void;
    loadProject: (id: string) => Promise<boolean>;
    clearProject: () => void;
    getProjectList: () => Array<{ id: string; name: string; updatedAt: Date }>;
    deleteProject: (id: string) => void;
    
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
    
    // UI management
    setActiveSidebarTab: (tab: SidebarTab) => void;
    
    // Utility
    reset: () => void;
  };
}

// Local storage utilities
const STORAGE_KEYS = {
  PROJECT_LIST: 'dreamreel_project_list',
  PROJECT_PREFIX: 'dreamreel_project_',
};

const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

export const useVideoEditorStore = create<VideoEditorState>((set, get) => ({
  // Initial state
  projectId: null,
  projectName: null,
  isProjectLoaded: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  mediaFiles: [],
  timelineElements: [],
  selectedElementId: null,
  isFileLoaded: false,
  activeSidebarTab: 'files',
  
  actions: {
    // Project management
    newProject: (name: string) => {
      const projectId = createId();
      set({
        projectId,
        projectName: name,
        isProjectLoaded: true,
        // Reset editor state
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        mediaFiles: [],
        timelineElements: [],
        selectedElementId: null,
        isFileLoaded: false,
        activeSidebarTab: 'files'
      });
      
      // Save empty project to localStorage
      const project: Project = {
        id: projectId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: 0,
        timelineElements: [],
        mediaFiles: []
      };
      
      saveToLocalStorage(`${STORAGE_KEYS.PROJECT_PREFIX}${projectId}`, project);
      
      // Update project list
      const projectList = loadFromLocalStorage(STORAGE_KEYS.PROJECT_LIST) || [];
      const projectInfo = {
        id: projectId,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingIndex = projectList.findIndex((p: any) => p.id === projectId);
      if (existingIndex >= 0) {
        projectList[existingIndex] = projectInfo;
      } else {
        projectList.push(projectInfo);
      }
      
      saveToLocalStorage(STORAGE_KEYS.PROJECT_LIST, projectList);
    },
    
    saveProject: () => {
      const state = get();
      if (!state.projectId || !state.projectName) {
        console.error('No project loaded to save');
        return;
      }
      
      const project: Project = {
        id: state.projectId,
        name: state.projectName,
        createdAt: new Date(), // This should ideally be preserved from creation
        updatedAt: new Date(),
        duration: state.duration,
        timelineElements: state.timelineElements,
        mediaFiles: state.mediaFiles
      };
      
      saveToLocalStorage(`${STORAGE_KEYS.PROJECT_PREFIX}${state.projectId}`, project);
      
      // Update project list with new updatedAt
      const projectList = loadFromLocalStorage(STORAGE_KEYS.PROJECT_LIST) || [];
      const projectIndex = projectList.findIndex((p: any) => p.id === state.projectId);
      if (projectIndex >= 0) {
        projectList[projectIndex].updatedAt = new Date();
        saveToLocalStorage(STORAGE_KEYS.PROJECT_LIST, projectList);
      }
    },
    
    loadProject: async (id: string): Promise<boolean> => {
      const project = loadFromLocalStorage(`${STORAGE_KEYS.PROJECT_PREFIX}${id}`);
      if (!project) {
        console.error('Project not found:', id);
        return false;
      }
      
      try {
        // Recreate File objects from stored data (this is a limitation of localStorage)
        const mediaFiles = await Promise.all(
          project.mediaFiles.map(async (mediaFile: MediaFile) => {
            // For localStorage implementation, we'll keep the existing URL
            // In a real implementation, files would be stored separately
            return {
              ...mediaFile,
              file: new File([], mediaFile.name, { type: `${mediaFile.type}/*` })
            };
          })
        );
        
        set({
          projectId: project.id,
          projectName: project.name,
          isProjectLoaded: true,
          duration: project.duration,
          timelineElements: project.timelineElements,
          mediaFiles,
          isFileLoaded: mediaFiles.length > 0,
          // Reset playback state
          isPlaying: false,
          currentTime: 0,
          selectedElementId: null
        });
        
        return true;
      } catch (error) {
        console.error('Failed to load project:', error);
        return false;
      }
    },
    
    clearProject: () => {
      set({
        projectId: null,
        projectName: null,
        isProjectLoaded: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        mediaFiles: [],
        timelineElements: [],
        selectedElementId: null,
        isFileLoaded: false,
        activeSidebarTab: 'files'
      });
    },
    
    getProjectList: () => {
      const projectList = loadFromLocalStorage(STORAGE_KEYS.PROJECT_LIST) || [];
      return projectList.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    },
    
    deleteProject: (id: string) => {
      // Remove project data
      removeFromLocalStorage(`${STORAGE_KEYS.PROJECT_PREFIX}${id}`);
      
      // Update project list
      const projectList = loadFromLocalStorage(STORAGE_KEYS.PROJECT_LIST) || [];
      const filteredList = projectList.filter((p: any) => p.id !== id);
      saveToLocalStorage(STORAGE_KEYS.PROJECT_LIST, filteredList);
      
      // If the deleted project is currently loaded, clear it
      const state = get();
      if (state.projectId === id) {
        get().actions.clearProject();
      }
    },
    
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
      
      // Auto-save project if one is loaded
      setTimeout(() => {
        const currentState = get();
        if (currentState.projectId) {
          currentState.actions.saveProject();
        }
      }, 100);
    },
    
    removeMediaFile: (id: string) => {
      set(state => ({
        mediaFiles: state.mediaFiles.filter(f => f.id !== id),
        timelineElements: state.timelineElements.filter(e => e.mediaFile?.id !== id),
        isFileLoaded: state.mediaFiles.length > 1
      }));
      
      // Auto-save project if one is loaded
      setTimeout(() => {
        const currentState = get();
        if (currentState.projectId) {
          currentState.actions.saveProject();
        }
      }, 100);
    },
    
    setIsFileLoaded: (loaded: boolean) => set({ isFileLoaded: loaded }),
    
    // Timeline management
    addTimelineElement: (element: TimelineElement) => {
      set(state => {
        // Use createId for consistent ID generation
        const elementWithId = {
          ...element,
          id: element.id || createId()
        };
        
        // Determine the highest existing track number
        const maxTrack = state.timelineElements.reduce((max, el) => Math.max(max, el.track), -1);
        const newTrackNumber = maxTrack + 1;

        // Assign a track number if not already provided
        const elementWithTrack = {
          ...elementWithId,
          track: elementWithId.track !== undefined ? elementWithId.track : newTrackNumber,
          // Set default properties based on type if not provided
          properties: {
            ...elementWithId.properties,
            ...(elementWithId.type === 'audio' && { volume: elementWithId.properties?.volume ?? 1 }),
            ...(elementWithId.type === 'video' && { volume: elementWithId.properties?.volume ?? 1, resolution: elementWithId.properties?.resolution ?? '1080p', playbackSpeed: elementWithId.properties?.playbackSpeed ?? 1 }),
            ...(elementWithId.type === 'image' && { displayDuration: elementWithId.properties?.displayDuration ?? 5 }),
            ...(elementWithId.type === 'text' && { text: elementWithId.properties?.text ?? 'New Text', fontSize: elementWithId.properties?.fontSize ?? 24, fontFamily: elementWithId.properties?.fontFamily ?? 'Arial', color: elementWithId.properties?.color ?? '#ffffff' }),
          }
        };

        const newElements = [...state.timelineElements, elementWithTrack];
        const maxEndTime = Math.max(...newElements.map(el => el.startTime + el.duration));
        return {
          timelineElements: newElements,
          duration: Math.max(state.duration, maxEndTime)
        };
      });
      
      // Auto-save project if one is loaded
      setTimeout(() => {
        const currentState = get();
        if (currentState.projectId) {
          currentState.actions.saveProject();
        }
      }, 100);
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
      
      // Auto-save project if one is loaded
      setTimeout(() => {
        const currentState = get();
        if (currentState.projectId) {
          currentState.actions.saveProject();
        }
      }, 100);
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
      
      // Auto-save project if one is loaded
      setTimeout(() => {
        const currentState = get();
        if (currentState.projectId) {
          currentState.actions.saveProject();
        }
      }, 100);
    },
    
    setSelectedElement: (id: string | null) => set({ selectedElementId: id }),
    
    // UI management
    setActiveSidebarTab: (tab: SidebarTab) => set({ activeSidebarTab: tab }),
    
    // Utility
    reset: () => set({
      projectId: null,
      projectName: null,
      isProjectLoaded: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      mediaFiles: [],
      timelineElements: [],
      selectedElementId: null,
      isFileLoaded: false,
      activeSidebarTab: 'files'
    })
  }
}));