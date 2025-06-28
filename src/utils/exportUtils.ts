import type { VideoExportData, TimelineClip } from '@/lib/services/remotion-lambda';

// Define interfaces that match your video editor store structure
// You'll need to adjust these based on your actual store types
interface EditorClip {
    id: string;
    type: 'video' | 'audio' | 'image' | 'text';
    startTime: number;
    endTime: number;
    duration: number;
    src?: string;
    content?: string;
    trackId: string;
    // Add other properties as needed
    [key: string]: any;
}

interface EditorState {
    clips: EditorClip[];
    aspectRatio: string;
    fps: number;
    duration: number;
    projectTitle?: string;
    projectDescription?: string;
}

/**
 * Converts video editor store data to the format required for Remotion Lambda export
 */
export function convertEditorDataToExportData(editorState: EditorState): VideoExportData {
    // Convert editor clips to export format
    const exportClips: TimelineClip[] = editorState.clips.map(clip => ({
        id: clip.id,
        type: clip.type,
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: clip.duration,
        src: clip.src,
        content: clip.content,
        trackId: clip.trackId,
        // Include any additional properties
        ...Object.fromEntries(
            Object.entries(clip).filter(([key]) =>
                !['id', 'type', 'startTime', 'endTime', 'duration', 'src', 'content', 'trackId'].includes(key)
            )
        ),
    }));

    return {
        clips: exportClips,
        aspectRatio: editorState.aspectRatio,
        fps: editorState.fps,
        duration: editorState.duration,
        title: editorState.projectTitle,
        description: editorState.projectDescription,
    };
}

/**
 * Validates that the editor data has the minimum required information for export
 */
export function validateExportData(editorState: EditorState): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!editorState.clips || editorState.clips.length === 0) {
        errors.push('No clips found in the timeline');
    }

    if (!editorState.aspectRatio) {
        errors.push('Aspect ratio is not set');
    }

    if (!editorState.fps || editorState.fps <= 0) {
        errors.push('Invalid frame rate');
    }

    if (!editorState.duration || editorState.duration <= 0) {
        errors.push('Invalid video duration');
    }

    // Check if any clips have required properties
    const invalidClips = editorState.clips.filter(clip =>
        !clip.id || !clip.type || clip.startTime < 0 || clip.endTime <= clip.startTime
    );

    if (invalidClips.length > 0) {
        errors.push(`${invalidClips.length} clips have invalid properties`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Gets a summary of the export data for display purposes
 */
export function getExportSummary(exportData: VideoExportData): {
    clipCount: number;
    totalDuration: string;
    aspectRatio: string;
    fps: number;
    hasVideo: boolean;
    hasAudio: boolean;
    hasImages: boolean;
    hasText: boolean;
} {
    const clipTypes = exportData.clips.map(clip => clip.type);

    // Format duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        clipCount: exportData.clips.length,
        totalDuration: formatDuration(exportData.duration),
        aspectRatio: exportData.aspectRatio,
        fps: exportData.fps,
        hasVideo: clipTypes.includes('video'),
        hasAudio: clipTypes.includes('audio'),
        hasImages: clipTypes.includes('image'),
        hasText: clipTypes.includes('text'),
    };
} 