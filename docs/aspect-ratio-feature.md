# Dreamreel Video Editor - Aspect Ratio Feature Documentation

## Overview

The aspect ratio feature allows users to select different video aspect ratios for their projects, enabling support for both portrait and landscape videos as well as square formats. This feature dynamically adjusts the video composition dimensions and affects the entire video editing workflow.

## Implementation Details

### Core Components

#### 1. **Video Editor Store Integration**
- **State**: Added `aspectRatio: string` to `VideoEditorState` interface
- **Action**: Added `setAspectRatio: (aspectRatio: string) => void` to actions
- **Default Value**: `'16:9'` (standard landscape format)
- **Reset Behavior**: Resets to `'16:9'` when store is reset

#### 2. **Navbar Aspect Ratio Selector**
- **Location**: Positioned next to the project name input in the navigation bar
- **Component**: Uses `SearchableSelect` component for dropdown selection
- **Options**: Predefined list of common aspect ratios:
  - `16:9` - Landscape (YouTube, TV)
  - `9:16` - Portrait (TikTok, Instagram Stories)
  - `1:1` - Square (Instagram Posts)
  - `4:3` - Standard (Classic TV)
  - `3:4` - Portrait (Classic)
  - `21:9` - Ultrawide (Cinema)
  - `2:3` - Portrait (Photography)
  - `3:2` - Landscape (Photography)

#### 3. **Dynamic Composition Dimensions**
- **Calculation Logic**: Maintains maximum dimension of 1920px while preserving aspect ratio
- **Landscape/Square**: Limited by width (max 1920px width)
- **Portrait**: Limited by height (max 1920px height)
- **Fallback**: Defaults to 1920×1080 (16:9) for invalid aspect ratios

#### 4. **Video Player Integration**
- **Real-time Updates**: Player dimensions update immediately when aspect ratio changes
- **Composition Properties**: `compositionWidth` and `compositionHeight` calculated dynamically
- **Visual Feedback**: Shows current aspect ratio and dimensions in player area

## Feature Impact on Other Components

### 1. **Export System**
- **Export Data**: Aspect ratio is included in export data sent to Remotion Lambda
- **Validation**: Export validation checks for valid aspect ratio format (width:height)
- **Remotion Rendering**: Uses selected aspect ratio for final video output

### 2. **Timeline Editor**
- **No Direct Impact**: Timeline functionality remains unchanged
- **Future Enhancement**: Could add aspect ratio-specific track layouts

### 3. **Media Import**
- **No Direct Impact**: Media files maintain their original properties
- **Composition Scaling**: Media is scaled/fitted to match selected aspect ratio during playback

### 4. **Video Composition**
- **Remotion Player**: Uses calculated dimensions for rendering
- **Element Positioning**: Text and image elements may need repositioning for different aspect ratios

## Usage Workflow

### 1. **Selecting Aspect Ratio**
```typescript
// User selects aspect ratio from dropdown
const handleAspectRatioChange = (newAspectRatio: string) => {
  actions.setAspectRatio(newAspectRatio);
  toast.success(`Aspect ratio changed to ${newAspectRatio}`);
};
```

### 2. **Dimension Calculation**
```typescript
// Automatic calculation based on aspect ratio
function calculateCompositionDimensions(aspectRatio: string): { width: number; height: number } {
  const maxDimension = 1920;
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  
  const ratio = widthRatio / heightRatio;
  
  if (ratio >= 1) {
    // Landscape or square
    return { width: maxDimension, height: Math.round(maxDimension / ratio) };
  } else {
    // Portrait
    return { width: Math.round(maxDimension * ratio), height: maxDimension };
  }
}
```

### 3. **Export Integration**
```typescript
// Export data includes selected aspect ratio
const exportData = {
  clips: timelineElements.map(/* ... */),
  aspectRatio: aspectRatio, // From store
  fps: 30,
  duration: duration,
  // ...
};
```

## Technical Specifications

### Aspect Ratio Format
- **Format**: `width:height` (e.g., "16:9", "1:1")
- **Validation**: Regex pattern `^\d+:\d+$`
- **Storage**: String value in Zustand store

### Dimension Constraints
- **Maximum Dimension**: 1920 pixels (width or height)
- **Minimum Dimension**: Calculated based on aspect ratio
- **Rounding**: Dimensions rounded to nearest integer

### Performance Considerations
- **Real-time Updates**: Aspect ratio changes trigger immediate player re-render
- **Memory Usage**: No significant impact on memory usage
- **Calculation Overhead**: Minimal computational overhead for dimension calculation

## Future Enhancements

### Planned Features
1. **Custom Aspect Ratios**: Allow users to input custom width:height ratios
2. **Preset Templates**: Aspect ratio presets for specific platforms (YouTube, TikTok, etc.)
3. **Smart Cropping**: Automatic content-aware cropping when changing aspect ratios
4. **Aspect Ratio Preview**: Visual preview of how content will look in different ratios

### Potential Improvements
1. **Responsive Timeline**: Adjust timeline track heights based on aspect ratio
2. **Element Auto-positioning**: Automatically reposition elements when aspect ratio changes
3. **Platform Optimization**: Suggest optimal aspect ratios based on export destination
4. **Batch Processing**: Apply aspect ratio changes to multiple projects

## Error Handling

### Invalid Aspect Ratios
- **Validation**: Checks for valid format before applying
- **Fallback**: Defaults to 16:9 for invalid inputs
- **User Feedback**: Toast notifications for successful changes

### Edge Cases
- **Zero Dimensions**: Prevented by validation and fallback logic
- **Extreme Ratios**: Limited by maximum dimension constraints
- **Non-numeric Values**: Handled by parsing validation

## Testing Considerations

### Test Cases
1. **Aspect Ratio Selection**: Verify all predefined ratios work correctly
2. **Dimension Calculation**: Test edge cases and extreme ratios
3. **Player Integration**: Ensure player updates correctly
4. **Export Functionality**: Verify aspect ratio is included in export data
5. **State Persistence**: Test aspect ratio persistence during session

### Performance Testing
1. **Real-time Updates**: Measure performance impact of aspect ratio changes
2. **Memory Usage**: Monitor memory consumption with different ratios
3. **Render Performance**: Test Remotion player performance with various dimensions

## Accessibility

### User Experience
- **Clear Labels**: Descriptive labels for each aspect ratio option
- **Visual Feedback**: Immediate visual feedback when aspect ratio changes
- **Keyboard Navigation**: Full keyboard support for dropdown selection
- **Screen Reader Support**: Proper ARIA labels and descriptions

### Responsive Design
- **Mobile Support**: Aspect ratio selector works on mobile devices
- **Touch Interaction**: Touch-friendly dropdown interface
- **Viewport Adaptation**: Player scales appropriately on different screen sizes