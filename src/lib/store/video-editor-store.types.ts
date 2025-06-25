
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

export type SidebarTab = 'files' | 'tracks';

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
    activeSidebarTab: SidebarTab;

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

        // UI management
        setActiveSidebarTab: (tab: SidebarTab) => void;

        // Utility
        reset: () => void;
    };
}