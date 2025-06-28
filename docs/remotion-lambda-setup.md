# Remotion Lambda Integration Setup

This document explains how to set up and use Remotion Lambda for video exports in the Dreamreel video editor.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Remotion Lambda Configuration
REMOTION_LAMBDA_REGION=us-east-1
REMOTION_LAMBDA_FUNCTION_NAME=remotion-render-your-function-name
REMOTION_LAMBDA_SERVE_URL=https://your-remotion-site.s3.amazonaws.com/sites/your-site
```

## Setup Steps

### 1. Deploy Remotion Lambda Function

```bash
# Deploy the Lambda function
npx remotion lambda functions deploy --memory=3009

# Create a site for your Remotion project
npx remotion lambda sites create --site-name=dreamreel-editor --enable-folder-expiry
```

### 2. Create Your Remotion Composition

Create a Remotion composition that can handle the timeline data from your video editor. The composition should accept the following props:

```typescript
interface VideoCompositionProps {
  clips: TimelineClip[];
  aspectRatio: string;
  fps: number;
  duration: number;
  title?: string;
  description?: string;
}
```

### 3. Configure AWS Permissions

Ensure your AWS Lambda execution role has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::your-bucket/*"],
      "Effect": "Allow"
    }
  ]
}
```

## Usage

### In Your Video Editor Component

```tsx
import { ExportButton } from '@/components/video-editor/ExportButton';
import { convertEditorDataToExportData, validateExportData } from '@/utils/exportUtils';

function VideoEditor() {
  const editorState = useVideoEditorStore(); // Your editor store
  
  const handleExport = () => {
    const validation = validateExportData(editorState);
    if (!validation.isValid) {
      console.error('Export validation failed:', validation.errors);
      return;
    }
    
    const exportData = convertEditorDataToExportData(editorState);
    // ExportButton will handle the rest
  };

  return (
    <div>
      {/* Your video editor UI */}
      <ExportButton 
        exportData={convertEditorDataToExportData(editorState)}
        disabled={!validateExportData(editorState).isValid}
      />
    </div>
  );
}
```

### API Endpoints

The integration provides three API endpoints:

1. **POST `/api/video/export/start`** - Starts a video export and returns render ID
2. **GET `/api/video/export/progress`** - Checks progress of a render job
3. **POST `/api/video/export`** - Complete export workflow (starts and waits for completion)

## Key Features

### 1. Empty Frame Trimming
The system automatically trims empty frames from the beginning and end of your timeline:

```typescript
import { trimTimelineEdges } from '@/lib/services/remotion-lambda';

const trimmedBounds = trimTimelineEdges(clips);
// Returns: { startTime, endTime, duration }
```

### 2. Progress Tracking
Real-time progress updates during the export process:

```typescript
import { useVideoExport } from '@/hooks/use-video-export';

const { isExporting, progress, error, outputUrl, startExport } = useVideoExport();
```

### 3. Backblaze S3 Integration
Exported videos are automatically stored in your Backblaze S3 bucket with:
- Automatic cleanup after 7 days
- Private access by default
- Organized folder structure (`exports/timestamp-title.mp4`)

## Troubleshooting

### Common Issues

1. **"Missing required Remotion Lambda environment variables"**
   - Ensure all three environment variables are set correctly
   - Check that your `.env` file is properly loaded

2. **"Failed to start export"**
   - Verify your AWS credentials and permissions
   - Check that the Lambda function is deployed and accessible
   - Ensure the serve URL is correct and accessible

3. **"Render completed but no output file was generated"**
   - Check CloudWatch logs for the Lambda function
   - Verify your Remotion composition is working correctly
   - Ensure the composition ID matches what's configured

### Debugging

Enable verbose logging for more detailed information:

```bash
npx remotion lambda render --log=verbose
```

View CloudWatch logs for your Lambda function to debug rendering issues.

## Cost Optimization

- **Memory**: Adjust Lambda memory based on your video complexity (default: 3009MB)
- **Frames per Lambda**: Optimize the `framesPerLambda` setting for your use case
- **Auto-cleanup**: Files are automatically deleted after 7 days to save storage costs
- **Privacy**: Videos are private by default to avoid unnecessary bandwidth costs

## Security Considerations

- All exported videos are private by default
- Use signed URLs for sharing if needed
- Environment variables should be kept secure
- Consider implementing user authentication for the export endpoints

## Performance Tips

1. **Optimize clip data**: Remove unnecessary properties from clips before export
2. **Use appropriate aspect ratios**: Common ratios (16:9, 1:1, 9:16) render faster
3. **Consider video length**: Longer videos take more time and resources
4. **Monitor costs**: Keep track of Lambda execution time and S3 storage usage 