import { MediaFile, TimelineElement } from "@/lib/store/video-editor-store.types";
import { VideoEditorState } from "@/lib/store/video-editor-store.types";

export interface TimelineTracksProps {
    allTrackNumbers: number[];
    trackGroups: Record<number, TimelineElement[]>;
    timelineElements: TimelineElement[];
    duration: number;
    trackHeight: number;
    pixelsPerSecond: number;
    selectedElementId: string | null;
    actions: VideoEditorState['actions'];
    tracksRef: React.RefObject<HTMLDivElement | null>;
    zoom: number;
}

export interface DropZone {
    trackNumber: number;
    position: number;
    insertionType: 'before' | 'after' | 'exact';
    targetElementId?: string;
    isValid: boolean;
}

export interface DragPreviewProps {
    mediaFile?: MediaFile;
    element?: TimelineElement;
    x: number;
    y: number;
    width: number;
    visible: boolean;
    isValidDrop: boolean;
    dragType: 'new' | 'existing';
}

export interface TimelineDropIndicatorProps {
    dropZone: DropZone;
    pixelsPerSecond: number;
    trackLabel: string;
    draggedItem: MediaFile | TimelineElement | null;
}
