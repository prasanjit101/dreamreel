import { NextRequest, NextResponse } from 'next/server';
import { checkRenderProgress } from '@/lib/services/remotion-lambda';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const renderId = searchParams.get('renderId');
        const bucketName = searchParams.get('bucketName');

        if (!renderId || !bucketName) {
            return NextResponse.json(
                { error: 'renderId and bucketName are required' },
                { status: 400 }
            );
        }

        const progress = await checkRenderProgress(renderId, bucketName);

        return NextResponse.json({
            success: true,
            ...progress,
        });

    } catch (error) {
        console.error('Progress check error:', error);

        return NextResponse.json(
            {
                error: 'Failed to check progress',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 