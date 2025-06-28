'use client';

import { useState, useCallback } from 'react';
import type { VideoExportData, ExportProgress } from '@/lib/services/remotion-lambda';

interface ExportState {
    isExporting: boolean;
    progress: number;
    error: string | null;
    outputUrl: string | null;
    renderId: string | null;
    bucketName: string | null;
}

export function useVideoExport() {
    const [state, setState] = useState<ExportState>({
        isExporting: false,
        progress: 0,
        error: null,
        outputUrl: null,
        renderId: null,
        bucketName: null,
    });

    const startExport = useCallback(async (exportData: VideoExportData) => {
        setState(prev => ({
            ...prev,
            isExporting: true,
            progress: 0,
            error: null,
            outputUrl: null,
            renderId: null,
            bucketName: null,
        }));

        try {
            // Start the export
            const response = await fetch('/api/video/export/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start export');
            }

            const { renderId, bucketName } = await response.json();

            setState(prev => ({
                ...prev,
                renderId,
                bucketName,
            }));

            // Start polling for progress
            return pollProgress(renderId, bucketName);

        } catch (error) {
            setState(prev => ({
                ...prev,
                isExporting: false,
                error: error instanceof Error ? error.message : 'Export failed',
            }));
            throw error;
        }
    }, []);

    const pollProgress = useCallback(async (renderId: string, bucketName: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(
                        `/api/video/export/progress?renderId=${renderId}&bucketName=${bucketName}`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to check progress');
                    }

                    const progressData: ExportProgress & { success: boolean } = await response.json();

                    setState(prev => ({
                        ...prev,
                        progress: Math.round(progressData.progress * 100),
                    }));

                    if (progressData.done) {
                        clearInterval(pollInterval);
                        setState(prev => ({
                            ...prev,
                            isExporting: false,
                            outputUrl: progressData.outputFile || null,
                            progress: 100,
                        }));

                        if (progressData.outputFile) {
                            resolve(progressData.outputFile);
                        } else {
                            reject(new Error('Export completed but no output file was generated'));
                        }
                    } else if (progressData.error) {
                        clearInterval(pollInterval);
                        setState(prev => ({
                            ...prev,
                            isExporting: false,
                            error: progressData.error || 'Export failed',
                        }));
                        reject(new Error(progressData.error));
                    }
                } catch (error) {
                    clearInterval(pollInterval);
                    setState(prev => ({
                        ...prev,
                        isExporting: false,
                        error: error instanceof Error ? error.message : 'Progress check failed',
                    }));
                    reject(error);
                }
            }, 2000); // Poll every 2 seconds
        });
    }, []);

    const reset = useCallback(() => {
        setState({
            isExporting: false,
            progress: 0,
            error: null,
            outputUrl: null,
            renderId: null,
            bucketName: null,
        });
    }, []);

    return {
        ...state,
        startExport,
        reset,
    };
} 