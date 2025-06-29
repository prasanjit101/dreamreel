import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../../env";

export async function POST(request: NextRequest) {
    try {
        const { prompt, aspectRatio = "1:1", style = "realistic" } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        if (!env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        console.log("Generating image with prompt:", prompt, "aspect ratio:", aspectRatio, "style:", style);

        const ai = new GoogleGenAI({
            apiKey: env.GEMINI_API_KEY
        });

        // Enhance the prompt based on the video editor context
        const enhancedPrompt = `Create a high-quality ${style} image for video editing purposes. ${prompt}. The image should be suitable for use in a video composition with good contrast and clarity. Aspect ratio should be ${aspectRatio}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: enhancedPrompt,
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            return NextResponse.json(
                { error: "No response candidates generated" },
                { status: 500 }
            );
        }

        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts) {
            return NextResponse.json(
                { error: "No content parts in response" },
                { status: 500 }
            );
        }

        // Find the image part in the response
        let imageData: string | null = null;
        let textDescription: string | null = null;

        for (const part of candidate.content.parts) {
            if (part.text) {
                textDescription = part.text;
                console.log("Generated description:", part.text);
            } else if (part.inlineData?.data) {
                imageData = part.inlineData.data;
                console.log("Image generated successfully");
            }
        }

        if (!imageData) {
            return NextResponse.json(
                { error: "No image data was generated" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imageData, // base64 string
            mimeType: "image/png",
            aspectRatio,
            description: textDescription,
            style
        });

    } catch (error) {
        console.error("Error generating image:", error);

        // Provide more specific error messages
        let errorMessage = "Failed to generate image";
        if (error instanceof Error) {
            if (error.message.includes("API key")) {
                errorMessage = "Invalid or missing Gemini API key";
            } else if (error.message.includes("quota")) {
                errorMessage = "API quota exceeded";
            } else if (error.message.includes("model")) {
                errorMessage = "Model not available or invalid";
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 