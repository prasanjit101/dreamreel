'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useVideoExport } from '@/hooks/use-video-export';
import type { VideoExportData } from '@/lib/services/remotion-lambda';

interface ExportButtonProps {
    exportData: VideoExportData;
    disabled?: boolean;
    className?: string;
}

export function ExportButton({ exportData, disabled = false, className }: ExportButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { isExporting, progress, error, outputUrl, startExport, reset } = useVideoExport();

    const handleExport = async () => {
        try {
            reset();
            setIsDialogOpen(true);
            await startExport(exportData);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleDownload = () => {
        if (outputUrl) {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = outputUrl;
            link.download = `${exportData.title || 'video'}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDialogClose = () => {
        if (!isExporting) {
            setIsDialogOpen(false);
            reset();
        }
    };

    return (
        <>
            <Button
                onClick={handleExport}
                disabled={disabled || isExporting}
                className={className}
                size="sm"
            >
                {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Download className="h-4 w-4 mr-2" />
                )}
                Export Video
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Video</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {isExporting && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Rendering video...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="w-full" />
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {outputUrl && !isExporting && (
                            <div className="space-y-3">
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Video exported successfully! Your video is ready for download.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button onClick={handleDownload} className="flex-1">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Video
                                    </Button>
                                    <Button variant="outline" onClick={handleDialogClose}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isExporting && (
                            <div className="text-sm text-muted-foreground">
                                This may take a few minutes depending on your video length and complexity.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 