# Dreamreel Video Editor - Drag and Drop System Documentation

## Overview

The Dreamreel video editor implements a comprehensive drag and drop system that allows users to:
- Drag media files from the Files Panel to Timeline Tracks
- Reposition existing timeline elements between tracks
- Get visual feedback during drag operations
- Auto-scroll the timeline during drag operations

## Architecture

### Core Components

#### 1. **FilesPanel.tsx**
- **Purpose**: Handles drag initiation for media files
- **Key Functions**:
  - `handleDragStart()`: Sets up drag data and visual feedback
  - `handleDragEnd()`: Cleanup after drag operation
- **Drag Data Format**:
  ```typescript
  {
    mediaFileId: string,
    mediaType: 'video' | 'audio' | 'image',
    source: 'filesPanel'
  }
  ```

#### 2. **TimelineTracks.tsx**
- **Purpose**: Main drag and drop handler for timeline
- **Key Functions**:
  - `handleDragOver()`: Validates drop zones and provides visual feedback
  - `handleDrop()`: Processes the drop operation
  - `findDropZone()`: Determines valid drop locations
- **Supports**: Both new media files and existing timeline elements

#### 3. **TimelineClip.tsx**
- **Purpose**: Handles drag operations for existing timeline elements
- **Key Functions**:
  - `handleDragStart()`: Initiates drag for existing elements
- **Drag Data Format**:
  ```typescript
  {
    timelineElementId: string,
    elementType: 'video' | 'audio' | 'image' | 'text'
  }
  ```

#### 4. **DragPreview.tsx**
- **Purpose**: Provides visual feedback during drag operations
- **Features**:
  - Shows item name and duration
  - Indicates valid/invalid drop zones with color coding
  - Differentiates between new and existing element drags

#### 5. **TimelineDropIndicator.tsx**
- **Purpose**: Shows where items will be placed on drop
- **Features**:
  - Position indicator line
  - Preview of item placement
  - Contextual messages for drop actions

### Supporting Files

#### 6. **timeline.types.ts**
- **Purpose**: TypeScript definitions for drag and drop system
- **Key Types**:
  - `DropZone`: Defines valid drop locations
  - `DragPreviewProps`: Props for drag preview component
  - `TimelineDropIndicatorProps`: Props for drop indicator

#### 7. **timelineUtils.ts**
- **Purpose**: Utility functions for drag and drop logic
- **Key Functions**:
  - `isMediaTypeCompatibleWithTrack()`: Validates track compatibility
  - `getClipColor()`: Returns appropriate colors for media types
  - `getClipIcon()`: Returns appropriate icons for media types

#### 8. **use-timeline-auto-scroll.ts**
- **Purpose**: Provides smooth auto-scrolling during drag operations
- **Features**:
  - Edge detection for scroll triggers
  - Smooth animation frames
  - Configurable scroll speed and thresholds

## Drag and Drop Flow

### 1. **New Media File Drag (Files Panel → Timeline)**

```mermaid
sequenceDiagram
    participant FP as FilesPanel
    participant TT as TimelineTracks
    participant VS as VideoStore
    
    FP->>FP: handleDragStart()
    FP->>TT: Drag data transfer
    TT->>TT: handleDragOver()
    TT->>TT: findDropZone()
    TT->>TT: Visual feedback
    TT->>TT: handleDrop()
    TT->>VS: addTimelineElement()
    TT->>TT: handleDragEnd()
```

### 2. **Existing Element Drag (Timeline → Timeline)**

```mermaid
sequenceDiagram
    participant TC as TimelineClip
    participant TT as TimelineTracks
    participant VS as VideoStore
    
    TC->>TC: handleDragStart()
    TC->>TT: Drag data transfer
    TT->>TT: handleDragOver()
    TT->>TT: findDropZone()
    TT->>TT: Visual feedback
    TT->>TT: handleDrop()
    TT->>VS: updateTimelineElement()
    TT->>TT: handleDragEnd()
```

## Track Compatibility Rules

| Track Number | Track Type | Compatible Media Types |
|--------------|------------|----------------------|
| 0 | Video | video |
| 1 | Audio | audio |
| 2 | Text | text |
| 3 | Image | image |
| 4+ | Custom | All types |

## Drop Zone Validation

### Valid Drop Conditions:
1. **Track Compatibility**: Media type matches track requirements
2. **No Collisions**: New position doesn't overlap existing elements
3. **Valid Position**: Drop position is within timeline bounds

### Drop Zone Types:
- **Exact**: Place at specific timeline position
- **Before**: Insert before existing element (future feature)
- **After**: Insert after existing element (future feature)

## Visual Feedback System

### Drag Preview
- **Green Border**: Valid drop location
- **Red Border**: Invalid drop location
- **Blue Ring**: Existing element being dragged
- **Item Info**: Shows name and duration

### Drop Indicators
- **Green Line**: Exact drop position
- **Green Preview**: Shows final element placement
- **Track Overlay**: Indicates valid/invalid track
- **Contextual Messages**: Explains drop action

### Track States
- **Default**: `bg-muted/20`
- **Valid Drop**: `bg-green-500/10 border-green-500/30`
- **Invalid Drop**: `bg-red-500/10 border-red-500/30`
- **Hover**: `hover:bg-muted/30`

## Auto-Scroll System

### Configuration
```typescript
{
  scrollSpeed: 3,           // Base scroll speed
  edgeThreshold: 60,        // Pixels from edge to trigger scroll
  isActive: isDragging      // Only active during drag
}
```

### Behavior
- **Left Edge**: Scroll timeline left when cursor approaches left edge
- **Right Edge**: Scroll timeline right when cursor approaches right edge
- **Speed Scaling**: Scroll speed increases closer to edge
- **Smooth Animation**: Uses `requestAnimationFrame` for smooth scrolling

## Error Handling

### Common Error Scenarios
1. **Invalid Drag Data**: Malformed JSON or missing properties
2. **Media File Not Found**: Referenced file doesn't exist in store
3. **Timeline Element Not Found**: Referenced element doesn't exist
4. **Track Incompatibility**: Wrong media type for track
5. **Collision Detection**: Drop would overlap existing elements

### Error Messages
- `"Invalid drag data"`: Drag data parsing failed
- `"Media file not found"`: Referenced media file missing
- `"Element not found"`: Referenced timeline element missing
- `"Cannot drop here - invalid location"`: Track incompatible or collision detected
- `"Invalid drop operation"`: General drop failure

## Performance Optimizations

### Drag State Management
- **Minimal Re-renders**: State updates only when necessary
- **Debounced Updates**: Drag preview updates throttled
- **Cleanup**: Proper cleanup on drag end

### Memory Management
- **Drag Image Cleanup**: Custom drag images removed after use
- **Event Listener Cleanup**: Global listeners properly removed
- **State Reset**: Drag state reset on completion

### Visual Performance
- **CSS Transitions**: Smooth visual feedback
- **Transform Usage**: Hardware-accelerated positioning
- **Opacity Changes**: Efficient visual state changes

## Future Enhancements

### Planned Features
1. **Edge Insertion**: Insert before/after existing elements
2. **Multi-Select Drag**: Drag multiple elements simultaneously
3. **Snap to Grid**: Snap to timeline grid intervals
4. **Magnetic Edges**: Snap to other element edges
5. **Undo/Redo**: Support for drag operations in history

### Potential Improvements
1. **Touch Support**: Mobile drag and drop
2. **Keyboard Navigation**: Keyboard-based element movement
3. **Batch Operations**: Multiple file drops
4. **Custom Drop Zones**: User-defined drop areas
5. **Advanced Collision**: Smart collision resolution

## Debugging

### Console Logging
The system includes comprehensive console logging for debugging:
- Drag start/end events
- Drop zone calculations
- Track compatibility checks
- Error conditions

### Debug Mode
Enable detailed logging by setting:
```typescript
const DEBUG_DRAG_DROP = true;
```

### Common Issues
1. **Drag Data Loss**: Check browser compatibility with `dataTransfer`
2. **Visual Glitches**: Verify CSS transitions and z-index values
3. **Performance Issues**: Monitor drag event frequency
4. **State Inconsistency**: Check store update patterns

## Testing

### Manual Testing Checklist
- [ ] Drag media file from Files Panel to each track type
- [ ] Drag existing timeline element to different tracks
- [ ] Test invalid drops (wrong track type)
- [ ] Test collision detection
- [ ] Verify auto-scroll functionality
- [ ] Check visual feedback accuracy
- [ ] Test drag cancellation (ESC key)
- [ ] Verify cleanup after drag operations

### Automated Testing
Consider implementing:
- Unit tests for utility functions
- Integration tests for drag and drop flows
- Visual regression tests for UI feedback
- Performance tests for large timelines

---

*Last Updated: January 2025*
*Version: 1.0.0*