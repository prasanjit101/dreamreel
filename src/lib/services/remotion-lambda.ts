import { renderMediaOnLambda, getRenderProgress, type RenderMediaOnLambdaInput } from '@remotion/lambda/client';
import { s3, B2_BUCKET_NAME } from './backblaze-s3';
import { env } from 'env';

export interface TimelineClip {
    id: string;
    type: 'video' | 'audio' | 'image' | 'text' | 'subtitle';
    startTime: number;
    endTime: number;
    duration: number;
    src?: string;
    content?: string;
    trackId: string;
    [key: string]: any;
}

export interface VideoExportData {
    clips: TimelineClip[];
    aspectRatio: string;
    fps: number;
    duration: number;
    title?: string;
    description?: string;
}

export interface ExportProgress {
    renderId: string;
    bucketName: string;
    progress: number;
    done: boolean;
    outputFile?: string;
    error?: string;
}

/**
 * Trims empty frames from the beginning and end of the timeline
 * Returns the actual start and end times where content exists
 */
export function trimTimelineEdges(clips: TimelineClip[]): { startTime: number; endTime: number; duration: number } {
    if (clips.length === 0) {
        return { startTime: 0, endTime: 0, duration: 0 };
    }

    // Find the earliest start time and latest end time across all clips
    const startTime = Math.min(...clips.map(clip => clip.startTime));
    const endTime = Math.max(...clips.map(clip => clip.endTime));
    const duration = endTime - startTime;

    return { startTime, endTime, duration };
}

/**
 * Prepares video data for Remotion rendering by trimming empty sections
 */
export function prepareVideoForRender(exportData: VideoExportData): VideoExportData & { trimmedBounds: { startTime: number; endTime: number; duration: number } } {
    const trimmedBounds = trimTimelineEdges(exportData.clips);

    // Adjust all clips relative to the new start time
    const adjustedClips = exportData.clips.map(clip => ({
        ...clip,
        startTime: clip.startTime - trimmedBounds.startTime,
        endTime: clip.endTime - trimmedBounds.startTime,
    }));

    return {
        ...exportData,
        clips: adjustedClips,
        duration: trimmedBounds.duration,
        trimmedBounds
    };
}

/**
 * Initiates a video render on Remotion Lambda
 */
export async function startVideoRender(exportData: VideoExportData): Promise<{ renderId: string; bucketName: string }> {
    const preparedData = prepareVideoForRender(exportData);

    // Ensure we have the required environment variables
    if (!env.REMOTION_LAMBDA_REGION || !env.REMOTION_LAMBDA_FUNCTION_NAME || !env.REMOTION_LAMBDA_SERVE_URL) {
        throw new Error('Missing required Remotion Lambda environment variables');
    }

    const renderParams: RenderMediaOnLambdaInput = {
        region: env.REMOTION_LAMBDA_REGION as RenderMediaOnLambdaInput['region'],
        functionName: env.REMOTION_LAMBDA_FUNCTION_NAME,
        serveUrl: env.REMOTION_LAMBDA_SERVE_URL,
        composition: 'VideoComposition', // This should match your Remotion composition ID
        codec: 'h264',
        inputProps: {
            clips: preparedData.clips,
            aspectRatio: preparedData.aspectRatio,
            fps: preparedData.fps,
            duration: preparedData.duration,
            title: preparedData.title,
            description: preparedData.description,
        },
        // Store output in our Backblaze bucket
        outName: {
            bucketName: B2_BUCKET_NAME,
            key: `exports/${Date.now()}-${preparedData.title || 'video'}.mp4`,
        },
        // Auto-delete after 7 days to save storage costs
        deleteAfter: '7-days',
        privacy: 'private', // Keep videos private by default
        maxRetries: 3,
        framesPerLambda: 20, // Optimize for performance
    };

    const { bucketName, renderId } = await renderMediaOnLambda(renderParams);

    return { renderId, bucketName };
}

/**
 * Checks the progress of a render job
 */
export async function checkRenderProgress(renderId: string, bucketName: string): Promise<ExportProgress> {
    if (!env.REMOTION_LAMBDA_REGION || !env.REMOTION_LAMBDA_FUNCTION_NAME) {
        throw new Error('Missing required Remotion Lambda environment variables');
    }

    const progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName: env.REMOTION_LAMBDA_FUNCTION_NAME,
        region: env.REMOTION_LAMBDA_REGION as RenderMediaOnLambdaInput['region'],
    });

    return {
        renderId,
        bucketName,
        progress: progress.overallProgress,
        done: progress.done,
        outputFile: progress.outputFile || undefined,
        error: progress.fatalErrorEncountered ? progress.errors?.[0]?.message : undefined,
    };
}

/**
 * Polls render progress until completion
 */
export async function waitForRenderCompletion(
    renderId: string,
    bucketName: string,
    onProgress?: (progress: ExportProgress) => void
): Promise<ExportProgress> {
    return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
            try {
                const progress = await checkRenderProgress(renderId, bucketName);

                if (onProgress) {
                    onProgress(progress);
                }

                if (progress.done) {
                    clearInterval(pollInterval);
                    resolve(progress);
                } else if (progress.error) {
                    clearInterval(pollInterval);
                    reject(new Error(progress.error));
                }
            } catch (error) {
                clearInterval(pollInterval);
                reject(error);
            }
        }, 2000); // Check every 2 seconds
    });
}

/**
 * Complete video export workflow
 */
export async function exportVideo(
    exportData: VideoExportData,
    onProgress?: (progress: ExportProgress) => void
): Promise<string> {
    // Start the render
    const { renderId, bucketName } = await startVideoRender(exportData);

    // Wait for completion
    const finalProgress = await waitForRenderCompletion(renderId, bucketName, onProgress);

    if (!finalProgress.outputFile) {
        throw new Error('Render completed but no output file was generated');
    }

    return finalProgress.outputFile;
} 