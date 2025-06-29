# SRT Subtitle Feature Documentation

## Overview

The SRT subtitle feature provides comprehensive subtitle support for the Dreamreel video editor, allowing users to import, edit, style, and render subtitles in their video projects. This feature integrates seamlessly with the existing video editor architecture and follows professional video editing standards.

## 🎯 Key Features

### 1. **SRT File Import & Parsing**
- Support for standard SRT (SubRip Subtitle) file format
- Automatic parsing of timecodes and text content
- Validation and error handling for malformed files
- Duration calculation from subtitle entries

### 2. **Professional Subtitle Editor**
- Modal-based editing interface with comprehensive controls
- Individual subtitle entry management (add, edit, delete)
- Real-time preview with styling
- Time format conversion (user-friendly ↔ SRT format)
- SRT export functionality

### 3. **Timeline Integration**
- Dedicated Subtitle Track (Track 4) with yellow color coding
- Full drag-and-drop support from Files Panel to Timeline
- Visual representation showing entry count and duration
- Proper track compatibility validation

### 4. **Video Composition & Rendering**
- Real-time subtitle display during video playback
- Customizable styling (font, color, position, alignment)
- Proper timing synchronization with video content
- Export-ready rendering for final video output

## 🏗️ Architecture Overview

### Core Components Structure

```
src/
├── components/video-editor/
│   ├── SubtitleEditorModal.tsx      # Main subtitle editing interface
│   ├── FilesPanel.tsx               # Enhanced with subtitle support
│   ├── PropertiesPanel.tsx          # Subtitle properties section
│   └── VideoComposition.tsx         # Subtitle rendering component
├── utils/
│   ├── mediaUtils.ts                # SRT parsing & formatting utilities
│   └── timelineUtils.ts             # Enhanced with subtitle track support
├── lib/store/
│   ├── video-editor-store.types.ts  # Type definitions
│   └── video-editor-store.ts        # State management
└── app/api/
    └── elevenlabs/tts/route.ts       # TTS integration (related feature)
```

## 📁 File-by-File Implementation Guide

### 1. Type Definitions (`video-editor-store.types.ts`)

**Key Additions:**
```typescript
// New subtitle entry interface
export interface SubtitleEntry {
    id: string;
    start: number; // in seconds
    end: number; // in seconds
    text: string;
}

// Enhanced MediaFile type
export interface MediaFile {
    type: 'video' | 'audio' | 'image' | 'subtitle'; // Added 'subtitle'
    subtitleEntries?: SubtitleEntry[]; // New property
    // ... existing properties
}

// Enhanced TimelineElement properties
properties?: {
    // ... existing properties
    subtitleEntries?: SubtitleEntry[];
    subtitleStyle?: {
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
        position?: 'bottom' | 'top' | 'center';
        alignment?: 'left' | 'center' | 'right';
    };
};
```

**Purpose:** Defines the data structures for subtitle functionality, extending existing types to support subtitle-specific properties.

### 2. Media Utilities (`utils/mediaUtils.ts`)

**Key Functions:**

#### `parseSrtFile(file: File)`
- **Purpose:** Parses SRT file content into structured subtitle entries
- **Returns:** `{ subtitleEntries: SubtitleEntry[]; duration: number }`
- **Features:** 
  - Handles SRT timecode format (HH:MM:SS,mmm)
  - Validates file structure
  - Calculates total duration

#### `formatSrtTimecode(seconds: number)`
- **Purpose:** Converts seconds to SRT format (HH:MM:SS,mmm)
- **Usage:** For export and display purposes

#### `exportToSrt(subtitleEntries: SubtitleEntry[])`
- **Purpose:** Converts subtitle entries back to SRT format
- **Usage:** Export edited subtitles as .srt files

**Extension Points:**
- Add support for other subtitle formats (VTT, ASS, etc.)
- Implement subtitle validation rules
- Add subtitle timing optimization functions

### 3. Timeline Utilities (`utils/timelineUtils.ts`)

**Key Enhancements:**

#### Track Compatibility
```typescript
case 4: // Subtitle Track
    const subtitleCompatible = mediaType === 'subtitle';
    return subtitleCompatible;
```

#### Visual Styling
```typescript
case 'subtitle':
    return 'bg-yellow-500/80 border-yellow-400 hover:bg-yellow-500/90';
```

**Extension Points:**
- Add subtitle-specific timeline interactions
- Implement subtitle collision detection
- Add subtitle track grouping features

### 4. Subtitle Editor Modal (`SubtitleEditorModal.tsx`)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Subtitle Editor Modal                    │
├─────────────────────────────────┬───────────────────────────┤
│        Subtitle Entries         │     Styling Controls      │
│                                 │                           │
│ ┌─ Entry #1 ─────────────────┐  │ ┌─ Font Settings ───────┐ │
│ │ Start: 00:00.0             │  │ │ Size: [24px]          │ │
│ │ End:   00:03.0             │  │ │ Family: [Arial ▼]     │ │
│ │ Text: [Hello World]        │  │ │ Color: [#ffffff]      │ │
│ │                      [🗑️] │  │ └───────────────────────┘ │
│ └───────────────────────────┘  │                           │
│                                 │ ┌─ Position ────────────┐ │
│ ┌─ Entry #2 ─────────────────┐  │ │ Position: [Bottom ▼]  │ │
│ │ ...                        │  │ │ Align: [Center ▼]     │ │
│ └───────────────────────────┘  │ └───────────────────────┘ │
│                                 │                           │
│ [+ Add Entry] [📥 Export SRT]   │ ┌─ Preview ─────────────┐ │
│                                 │ │ [Sample subtitle]     │ │
│                                 │ └───────────────────────┘ │
└─────────────────────────────────┴───────────────────────────┘
```

**Key Features:**
- **Entry Management:** Add, edit, delete subtitle entries
- **Time Formatting:** User-friendly MM:SS.S format with SRT conversion
- **Real-time Preview:** Live preview of styling changes
- **Validation:** Prevents invalid entries (start >= end, empty text)
- **Export:** Re-export edited subtitles as SRT files

**Extension Points:**
- Add batch editing operations
- Implement subtitle timing adjustment tools
- Add subtitle translation features
- Include subtitle templates

### 5. Video Composition (`VideoComposition.tsx`)

**Subtitle Rendering Architecture:**
```typescript
const SubtitleRenderer: React.FC<SubtitleRendererProps> = ({ 
  subtitleEntries, 
  currentTime, 
  style 
}) => {
  // Find current subtitle based on timing
  const currentSubtitle = subtitleEntries.find(entry => 
    currentTime >= entry.start && currentTime <= entry.end
  );

  // Render with styling
  return (
    <AbsoluteFill>
      <div style={getPositionStyles()}>
        <div style={subtitleStyles}>
          {currentSubtitle.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

**Features:**
- **Timing Synchronization:** Accurate subtitle display based on current time
- **Dynamic Styling:** Applies user-defined styling in real-time
- **Position Control:** Bottom, center, top positioning
- **Text Alignment:** Left, center, right alignment
- **Background Support:** Configurable background for readability

**Extension Points:**
- Add subtitle animations (fade in/out, slide effects)
- Implement multi-line subtitle support
- Add subtitle outline/shadow effects
- Include subtitle karaoke effects

### 6. Files Panel Integration (`FilesPanel.tsx`)

**Enhanced Features:**
- **Edit Button:** Dedicated edit button for subtitle files (ellipsis icon)
- **Visual Indicators:** Yellow color coding and entry count display
- **Drag & Drop:** Full support for dragging subtitles to timeline
- **File Info:** Shows subtitle-specific information (entry count, duration)

**Extension Points:**
- Add subtitle preview in Files Panel
- Implement subtitle search functionality
- Add subtitle batch operations
- Include subtitle format conversion

## 🔄 Data Flow

### 1. Import Flow
```
SRT File Upload → parseSrtFile() → MediaFile Creation → Files Panel Display
```

### 2. Edit Flow
```
Edit Button Click → SubtitleEditorModal → Entry Editing → Save → Store Update
```

### 3. Timeline Flow
```
Drag from Files → Timeline Drop → TimelineElement Creation → Track 4 Assignment
```

### 4. Rendering Flow
```
Video Playback → Current Time → Find Active Subtitle → Render with Styling
```

## 🎨 User Experience Workflow

### 1. **Import Subtitles**
1. User uploads .srt file via MediaUploader
2. File is parsed and validated
3. Subtitle entries are extracted and stored
4. File appears in Files Panel with yellow indicator

### 2. **Edit Subtitles**
1. User clicks edit button (ellipsis) on subtitle file
2. SubtitleEditorModal opens with current entries
3. User can add/edit/delete entries and adjust styling
4. Changes are saved and applied to all timeline instances

### 3. **Add to Timeline**
1. User drags subtitle file to Timeline Track 4
2. TimelineElement is created with subtitle properties
3. Subtitle clip appears on timeline with entry count

### 4. **Preview & Export**
1. Subtitles display during video playback
2. Styling is applied in real-time
3. Final video export includes rendered subtitles

## 🔧 Configuration & Customization

### Default Subtitle Styling
```typescript
const defaultSubtitleStyle = {
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  position: 'bottom',
  alignment: 'center'
};
```

### Track Configuration
- **Track Number:** 4 (Subtitle Track)
- **Color:** Yellow (`bg-yellow-500`)
- **Icon:** Subtitles (from Lucide React)
- **Compatibility:** Only accepts 'subtitle' media type

## 🚀 Extension Opportunities

### 1. **Additional Subtitle Formats**
```typescript
// Add to mediaUtils.ts
export function parseVttFile(file: File): Promise<SubtitleData> {
  // WebVTT format parsing
}

export function parseAssFile(file: File): Promise<SubtitleData> {
  // Advanced SubStation Alpha format parsing
}
```

### 2. **Advanced Styling Features**
```typescript
// Extend SubtitleStyle interface
interface SubtitleStyle {
  // ... existing properties
  outline?: {
    width: number;
    color: string;
  };
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  animation?: {
    type: 'fade' | 'slide' | 'typewriter';
    duration: number;
  };
}
```

### 3. **Subtitle Analytics**
```typescript
// Add to SubtitleEditorModal
const analyzeSubtitles = (entries: SubtitleEntry[]) => {
  return {
    totalDuration: calculateTotalDuration(entries),
    averageReadingSpeed: calculateReadingSpeed(entries),
    gapAnalysis: findTimingGaps(entries),
    textComplexity: analyzeTextComplexity(entries)
  };
};
```

### 4. **Batch Operations**
```typescript
// Add to SubtitleEditorModal
const batchOperations = {
  adjustTiming: (entries: SubtitleEntry[], offset: number) => {
    return entries.map(entry => ({
      ...entry,
      start: entry.start + offset,
      end: entry.end + offset
    }));
  },
  
  splitLongSubtitles: (entries: SubtitleEntry[], maxLength: number) => {
    // Split subtitles that exceed character limit
  },
  
  mergeShortSubtitles: (entries: SubtitleEntry[], minDuration: number) => {
    // Merge subtitles that are too short
  }
};
```

### 5. **AI-Powered Features**
```typescript
// Future AI integration possibilities
interface AISubtitleFeatures {
  autoTranslate: (entries: SubtitleEntry[], targetLanguage: string) => Promise<SubtitleEntry[]>;
  generateFromAudio: (audioFile: File) => Promise<SubtitleEntry[]>;
  optimizeTiming: (entries: SubtitleEntry[]) => SubtitleEntry[];
  suggestStyling: (videoContent: VideoAnalysis) => SubtitleStyle;
}
```

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **SRT Parsing Errors**
   - Check file encoding (should be UTF-8)
   - Validate timecode format (HH:MM:SS,mmm)
   - Ensure proper line breaks between entries

2. **Timeline Synchronization**
   - Verify subtitle timing matches video timeline
   - Check for overlapping subtitle entries
   - Ensure proper frame rate conversion

3. **Rendering Issues**
   - Validate subtitle styling properties
   - Check for text overflow in small viewports
   - Ensure proper z-index layering

### Debug Utilities
```typescript
// Add to development environment
const debugSubtitles = {
  validateEntries: (entries: SubtitleEntry[]) => {
    // Validation logic
  },
  
  logTimingIssues: (entries: SubtitleEntry[]) => {
    // Timing analysis
  },
  
  previewStyling: (style: SubtitleStyle) => {
    // Style preview
  }
};
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Memory Management**
   - Lazy load subtitle entries for large files
   - Implement virtual scrolling for entry lists
   - Cache parsed subtitle data

2. **Rendering Performance**
   - Use React.memo for subtitle components
   - Optimize re-renders during timeline scrubbing
   - Implement subtitle culling for off-screen content

3. **File Handling**
   - Stream large SRT files instead of loading entirely
   - Implement progressive parsing for better UX
   - Add file size limits and warnings

## 🔮 Future Roadmap

### Phase 1: Core Enhancements
- [ ] Support for additional subtitle formats (VTT, ASS)
- [ ] Advanced styling options (outline, shadow, animations)
- [ ] Subtitle timing optimization tools
- [ ] Batch editing operations

### Phase 2: AI Integration
- [ ] Automatic subtitle generation from audio
- [ ] AI-powered translation
- [ ] Smart timing adjustment
- [ ] Content-aware styling suggestions

### Phase 3: Collaboration Features
- [ ] Multi-user subtitle editing
- [ ] Version control for subtitle files
- [ ] Comment and review system
- [ ] Subtitle approval workflow

### Phase 4: Advanced Features
- [ ] Subtitle templates and presets
- [ ] Integration with subtitle services
- [ ] Advanced analytics and reporting
- [ ] Accessibility compliance tools

## 📚 Related Documentation

- [Drag and Drop System](./drag-and-drop-system.md) - Timeline interaction system
- [Aspect Ratio Feature](./aspect-ratio-feature.md) - Video composition settings
- [Remotion Lambda Setup](./remotion-lambda-setup.md) - Video export configuration

## 🤝 Contributing

When extending the subtitle feature:

1. **Follow Existing Patterns:** Use the established component structure and naming conventions
2. **Maintain Type Safety:** Update TypeScript interfaces when adding new properties
3. **Test Thoroughly:** Ensure new features work across different subtitle formats and edge cases
4. **Document Changes:** Update this documentation when adding new functionality
5. **Consider Performance:** Optimize for large subtitle files and real-time rendering

This comprehensive subtitle system provides a solid foundation for professional video editing workflows while maintaining the flexibility to extend and customize based on future requirements.