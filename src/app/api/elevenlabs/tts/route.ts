import { NextRequest, NextResponse } from 'next/server';
import { env } from 'env';

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId, duration } = await request.json();

        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text is required and cannot be empty' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text is too long. Maximum 5000 characters allowed.' },
                { status: 400 }
            );
        }

        // Use provided voice ID or default from environment
        const selectedVoiceId = voiceId || 'ZthjuvLPty3kTMaNKVKb';

        // Prepare the request to Eleven Labs API
        const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;
        
        const elevenLabsResponse = await fetch(elevenLabsUrl, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': env.ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: text.trim(),
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                    style: 0.0,
                    use_speaker_boost: true,
                },
            }),
        });

        if (!elevenLabsResponse.ok) {
            const errorText = await elevenLabsResponse.text();
            console.error('Eleven Labs API error:', errorText);
            
            if (elevenLabsResponse.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid Eleven Labs API key' },
                    { status: 401 }
                );
            }
            
            if (elevenLabsResponse.status === 422) {
                return NextResponse.json(
                    { error: 'Invalid voice ID or text content' },
                    { status: 422 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to generate audio from Eleven Labs' },
                { status: elevenLabsResponse.status }
            );
        }

        // Get the audio data as array buffer
        const audioBuffer = await elevenLabsResponse.arrayBuffer();

        // Return the audio data with appropriate headers
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('TTS API error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error during audio generation',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}