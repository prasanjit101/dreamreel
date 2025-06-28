import { NextRequest, NextResponse } from 'next/server';
import { exportVideo, type VideoExportData } from '@/lib/services/remotion-lambda';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clips, aspectRatio, fps, duration, title, description } = body as VideoExportData;

        // Validate required fields
        if (!clips || !Array.isArray(clips) || clips.length === 0) {
            return NextResponse.json(
                { error: 'Clips array is required and cannot be empty' },
                { status: 400 }
            );
        }

        if (!aspectRatio || !fps) {
            return NextResponse.json(
                { error: 'Aspect ratio and FPS are required' },
                { status: 400 }
            );
        }

        // Start the export process
        const outputUrl = await exportVideo({
            clips,
            aspectRatio,
            fps,
            duration: duration || 0,
            title,
            description,
        });

        return NextResponse.json({
            success: true,
            outputUrl,
            message: 'Video exported successfully',
        });

    } catch (error) {
        console.error('Video export error:', error);

        return NextResponse.json(
            {
                error: 'Failed to export video',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 