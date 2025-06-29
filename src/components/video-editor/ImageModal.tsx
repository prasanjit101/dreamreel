"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (imageData: string, fileName: string) => void;
    aspectRatio: string;
}

interface GeneratedImageData {
    imageData: string;
    mimeType: string;
    aspectRatio: string;
}

export function ImageModal({ isOpen, onClose, onImport, aspectRatio }: ImageModalProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<GeneratedImageData | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt for image generation");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/gemini/generate-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate image");
            }

            if (data.success) {
                setGeneratedImage({
                    imageData: data.imageData,
                    mimeType: data.mimeType,
                    aspectRatio: data.aspectRatio,
                });
                toast.success("Image generated successfully!");
            } else {
                throw new Error("Failed to generate image");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImport = () => {
        if (!generatedImage) return;

        // Create a filename based on the prompt and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `gemini-generated-${timestamp}.png`;

        // Pass the base64 data to the parent component
        onImport(`data:${generatedImage.mimeType};base64,${generatedImage.imageData}`, fileName);

        // Reset state and close modal
        setPrompt("");
        setGeneratedImage(null);
        onClose();

        toast.success("Image imported to media files!");
    };

    const handleClose = () => {
        setPrompt("");
        setGeneratedImage(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Generate Image with Gemini
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Describe the image you want to generate</Label>
                        <Textarea
                            id="prompt"
                            placeholder="e.g., A futuristic cityscape at sunset with flying cars and neon lights..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full"
                        size="lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Image...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Image
                            </>
                        )}
                    </Button>

                    {/* Generated Image Preview */}
                    {generatedImage && (
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <div className="aspect-square relative overflow-hidden rounded-md bg-background">
                                    <img
                                        src={`data:${generatedImage.mimeType};base64,${generatedImage.imageData}`}
                                        alt="Generated image"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            {/* Import Button */}
                            <div className="flex gap-2">
                                <Button onClick={handleImport} className="flex-1" size="lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    Import to Media Files
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setGeneratedImage(null)}
                                    size="lg"
                                >
                                    Generate New
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 