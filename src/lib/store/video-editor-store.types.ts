export interface MediaFile {
    id: string;
    name: string;
    type: 'video' | 'audio' | 'image' | 'subtitle';
    url: string;
    duration?: number;
    file: File;
    subtitleEntries?: SubtitleEntry[];
}

export interface SubtitleEntry {
    id: string;
    start: number; // in seconds
    end: number; // in seconds
    text: string;
}

export interface TimelineElement {
    id: string;
    type: 'video' | 'audio' | 'image' | 'text' | 'subtitle';
    startTime: number;
    duration: number;
    track: number;
    mediaFile?: MediaFile;
    properties?: {
        // Common properties
        volume?: number; // For audio/video
        x?: number; // For image/text/video position
        y?: number; // For image/text/video position
        scale?: number; // For image/text scaling (default: 1)
        width?: number; // For image/text width
        height?: number; // For image/text height
        rotation?: number; // For image/text rotation in degrees
        opacity?: number; // For image/text opacity (0-1)

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

        // Subtitle specific
        subtitleEntries?: SubtitleEntry[];
        subtitleStyle?: {
            fontSize?: number;
            fontFamily?: string;
            color?: string;
            backgroundColor?: string;
            position?: 'bottom' | 'top' | 'center';
            alignment?: 'left' | 'center' | 'right';
        };
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

    // Project settings
    aspectRatio: string;

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

        // Project settings
        setAspectRatio: (aspectRatio: string) => void;

        // UI management
        setActiveSidebarTab: (tab: SidebarTab) => void;

        // Utility
        reset: () => void;
    };
}