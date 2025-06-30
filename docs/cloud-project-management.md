# Cloud-Based Project Management Implementation

This document outlines the comprehensive plan to transform Dreamreel from a client-side video editor into a cloud-based application where users can save, load, and manage their video projects online.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema Design](#database-schema-design)
3. [tRPC API Implementation](#trpc-api-implementation)
4. [Store Management Updates](#store-management-updates)
5. [File Upload & Storage](#file-upload--storage)
6. [User Interface Integration](#user-interface-integration)
7. [Export System Updates](#export-system-updates)
8. [Implementation Timeline](#implementation-timeline)
9. [Security Considerations](#security-considerations)
10. [Performance Optimizations](#performance-optimizations)

## Overview

The cloud-based implementation will allow users to:
- Create and save video projects to the cloud
- Load existing projects from any device
- Share projects with team members (future feature)
- Maintain project history and versioning
- Access projects across multiple sessions

### Architecture Overview

```
Client (Browser)
├── Video Editor Store (Zustand)
├── Media Files (Local + S3 URLs)
├── Timeline Elements (Local State)
└── Project Management UI

Server (Next.js API)
├── tRPC Routers
├── Database (SQLite/LibSQL + Drizzle)
├── Authentication (Better Auth)
└── File Storage (Backblaze S3)

External Services
├── Backblaze S3 (Media Storage)
└── Remotion Lambda (Video Rendering)
```

## Database Schema Design

### 1. Projects Table

**File:** `src/server/db/schema/project.ts`

```typescript
export const project = sqliteTable("project", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Project Configuration
  aspectRatio: text("aspect_ratio").notNull().default("16:9"),
  duration: real("duration").notNull().default(0),
  fps: integer("fps").notNull().default(30),
  
  // Project State
  isPublic: integer("is_public", { mode: 'boolean' }).default(false),
  thumbnailUrl: text("thumbnail_url"), // S3 URL for project thumbnail
  
  // Metadata
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
  lastOpenedAt: integer("last_opened_at", { mode: 'timestamp' }),
  
  // Version Control
  version: integer("version").notNull().default(1),
  parentProjectId: text("parent_project_id").references(() => project.id),
});
```

**Purpose:** Stores high-level project information and configuration.

**Key Features:**
- Links to user via `userId` foreign key
- Stores project settings (aspect ratio, duration, fps)
- Supports versioning for project history
- Includes metadata for sorting and filtering

### 2. Project Media Files Table

**File:** `src/server/db/schema/projectMediaFile.ts`

```typescript
export const projectMediaFile = sqliteTable("project_media_file", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => project.id, { onDelete: 'cascade' }),
  
  // File Information
  name: text("name").notNull(),
  originalName: text("original_name").notNull(), // Original filename
  type: text("type").notNull(), // 'video' | 'audio' | 'image' | 'subtitle'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  
  // Storage Information
  s3Url: text("s3_url").notNull(), // Backblaze S3 URL
  s3Key: text("s3_key").notNull(), // S3 object key for deletion
  
  // Media Properties
  duration: real("duration"), // for video/audio files
  width: integer("width"), // for video/image files
  height: integer("height"), // for video/image files
  
  // Subtitle-specific data
  subtitleEntries: text("subtitle_entries", { mode: 'json' }), // JSON array of subtitle entries
  
  // Metadata
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});
```

**Purpose:** Stores metadata about media files associated with projects.

**Key Features:**
- Links to projects via `projectId` foreign key
- Stores both original file info and S3 storage details
- Handles different media types with appropriate properties
- JSON field for subtitle entries

### 3. Project Timeline Elements Table

**File:** `src/server/db/schema/projectTimelineElement.ts`

```typescript
export const projectTimelineElement = sqliteTable("project_timeline_element", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => project.id, { onDelete: 'cascade' }),
  mediaFileId: text("media_file_id").references(() => projectMediaFile.id, { onDelete: 'cascade' }),
  
  // Timeline Position
  type: text("type").notNull(), // 'video' | 'audio' | 'image' | 'text' | 'subtitle'
  startTime: real("start_time").notNull(),
  duration: real("duration").notNull(),
  track: integer("track").notNull(),
  
  // Element Properties (JSON for flexibility)
  properties: text("properties", { mode: 'json' }).notNull(),
  
  // Ordering
  zIndex: integer("z_index").default(0),
  
  // Metadata
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});
```

**Purpose:** Stores individual timeline elements and their configurations.

**Key Features:**
- Links to projects and optionally to media files
- Flexible `properties` JSON field for element-specific settings
- Supports all timeline element types
- Maintains timeline ordering with `zIndex`

### 4. Database Relations

```typescript
// In each schema file, define relations
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  mediaFiles: many(projectMediaFile),
  timelineElements: many(projectTimelineElement),
  parentProject: one(project, {
    fields: [project.parentProjectId],
    references: [project.id],
  }),
  childProjects: many(project),
}));

export const projectMediaFileRelations = relations(projectMediaFile, ({ one }) => ({
  project: one(project, {
    fields: [projectMediaFile.projectId],
    references: [project.id],
  }),
}));

export const projectTimelineElementRelations = relations(projectTimelineElement, ({ one }) => ({
  project: one(project, {
    fields: [projectTimelineElement.projectId],
    references: [project.id],
  }),
  mediaFile: one(projectMediaFile, {
    fields: [projectTimelineElement.mediaFileId],
    references: [projectMediaFile.id],
  }),
}));
```

## tRPC API Implementation

### Project Router

**File:** `src/server/api/routers/project.ts`

```typescript
export const projectRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Implementation details
    }),

  // Update an existing project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Implementation details
    }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Implementation details
    }),

  // List user's projects
  list: protectedProcedure
    .input(listProjectsSchema)
    .query(async ({ ctx, input }) => {
      // Implementation details
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation details
    }),

  // Duplicate a project
  duplicate: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation details
    }),
});
```

### Input Schemas

```typescript
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  aspectRatio: z.string().default("16:9"),
  mediaFiles: z.array(mediaFileSchema),
  timelineElements: z.array(timelineElementSchema),
  duration: z.number().min(0),
});

const mediaFileSchema = z.object({
  name: z.string(),
  type: z.enum(['video', 'audio', 'image', 'subtitle']),
  file: z.instanceof(File), // For upload
  duration: z.number().optional(),
  subtitleEntries: z.array(subtitleEntrySchema).optional(),
});

const timelineElementSchema = z.object({
  type: z.enum(['video', 'audio', 'image', 'text', 'subtitle']),
  startTime: z.number(),
  duration: z.number(),
  track: z.number(),
  properties: z.record(z.any()),
  mediaFileId: z.string().optional(),
});
```

## Store Management Updates

### Enhanced Video Editor Store

**File:** `src/lib/store/video-editor-store.ts`

```typescript
interface VideoEditorState {
  // Existing state...
  
  // Project Management
  currentProject: {
    id: string | null;
    name: string;
    description?: string;
    isSaved: boolean;
    lastSavedAt: Date | null;
  };
  
  // Loading states
  isLoadingProject: boolean;
  isSavingProject: boolean;
  
  actions: {
    // Existing actions...
    
    // Project Management Actions
    createProject: (name: string, description?: string) => Promise<void>;
    saveProject: () => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;
    updateProjectMetadata: (updates: { name?: string; description?: string }) => void;
    markProjectAsUnsaved: () => void;
    
    // Auto-save functionality
    enableAutoSave: () => void;
    disableAutoSave: () => void;
  };
}
```

### Project Management Actions Implementation

```typescript
// In the store implementation
actions: {
  createProject: async (name: string, description?: string) => {
    set({ isLoadingProject: true });
    
    try {
      const state = get();
      const projectData = {
        name,
        description,
        aspectRatio: state.aspectRatio,
        duration: state.duration,
        mediaFiles: state.mediaFiles,
        timelineElements: state.timelineElements,
      };
      
      const project = await trpc.project.create.mutate(projectData);
      
      set({
        currentProject: {
          id: project.id,
          name: project.name,
          description: project.description,
          isSaved: true,
          lastSavedAt: new Date(),
        },
        isLoadingProject: false,
      });
    } catch (error) {
      set({ isLoadingProject: false });
      throw error;
    }
  },

  saveProject: async () => {
    const state = get();
    if (!state.currentProject.id) {
      throw new Error('No project to save');
    }
    
    set({ isSavingProject: true });
    
    try {
      const projectData = {
        id: state.currentProject.id,
        aspectRatio: state.aspectRatio,
        duration: state.duration,
        mediaFiles: state.mediaFiles,
        timelineElements: state.timelineElements,
      };
      
      await trpc.project.update.mutate(projectData);
      
      set({
        currentProject: {
          ...state.currentProject,
          isSaved: true,
          lastSavedAt: new Date(),
        },
        isSavingProject: false,
      });
    } catch (error) {
      set({ isSavingProject: false });
      throw error;
    }
  },

  loadProject: async (projectId: string) => {
    set({ isLoadingProject: true });
    
    try {
      const project = await trpc.project.getById.query({ id: projectId });
      
      set({
        currentProject: {
          id: project.id,
          name: project.name,
          description: project.description,
          isSaved: true,
          lastSavedAt: new Date(project.updatedAt),
        },
        aspectRatio: project.aspectRatio,
        duration: project.duration,
        mediaFiles: project.mediaFiles,
        timelineElements: project.timelineElements,
        isLoadingProject: false,
        isFileLoaded: project.mediaFiles.length > 0,
      });
    } catch (error) {
      set({ isLoadingProject: false });
      throw error;
    }
  },
}
```

## File Upload & Storage

### Enhanced Media Upload Process

**File:** `src/utils/mediaUtils.ts`

```typescript
/**
 * Uploads a file to Backblaze S3 and returns the URL
 */
export async function uploadFileToS3(file: File, projectId: string): Promise<{
  url: string;
  key: string;
}> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
  const key = `projects/${projectId}/media/${fileName}`;
  
  const uploadParams = {
    Bucket: B2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
    ACL: 'private', // Keep files private
  };
  
  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    
    // Generate the S3 URL
    const url = `${env.BACKBLAZE_ENDPOINT}/${B2_BUCKET_NAME}/${key}`;
    
    return { url, key };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Enhanced createMediaFile function that uploads to S3
 */
export async function createCloudMediaFile(
  file: File, 
  projectId: string
): Promise<MediaFile> {
  // Upload file to S3
  const { url, key } = await uploadFileToS3(file, projectId);
  
  const mediaFile: MediaFile = {
    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    type: getMediaType(file),
    url, // S3 URL instead of blob URL
    file, // Keep original file for local operations
    s3Key: key, // Store S3 key for deletion
  };

  // Handle different media types
  if (mediaFile.type === 'subtitle') {
    const { subtitleEntries, duration } = await parseSrtFile(file);
    mediaFile.subtitleEntries = subtitleEntries;
    mediaFile.duration = duration;
  } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    // Get duration from media element
    const duration = await getMediaDuration(file);
    mediaFile.duration = duration;
  } else {
    mediaFile.duration = 5; // Default for images
  }

  return mediaFile;
}

/**
 * Gets duration from video/audio file
 */
function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const element = file.type.startsWith('video/') 
      ? document.createElement('video')
      : document.createElement('audio');
    
    element.src = URL.createObjectURL(file);
    element.preload = 'metadata';
    
    element.onloadedmetadata = () => {
      URL.revokeObjectURL(element.src);
      resolve(element.duration);
    };
    
    element.onerror = () => {
      URL.revokeObjectURL(element.src);
      reject(new Error('Failed to load media metadata'));
    };
  });
}
```

### File Deletion Utility

```typescript
/**
 * Deletes a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const deleteParams = {
    Bucket: B2_BUCKET_NAME,
    Key: key,
  };
  
  try {
    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
  } catch (error) {
    console.error(`Failed to delete file from S3: ${error.message}`);
    // Don't throw error - file deletion is not critical
  }
}
```

## User Interface Integration

### Project Management in Navbar

**File:** `src/components/video-editor/Navbar.tsx`

```typescript
// Add project management buttons
<div className="flex items-center gap-2">
  <ProjectSaveButton />
  <ProjectLoadButton />
  <ProjectSettingsButton />
  
  {/* Existing export button */}
  <ExportButton />
</div>
```

### Project Save Button Component

**File:** `src/components/project-management/ProjectSaveButton.tsx`

```typescript
export function ProjectSaveButton() {
  const { currentProject, isSavingProject, actions } = useVideoEditorStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = async () => {
    try {
      if (currentProject.id) {
        await actions.saveProject();
        toast.success('Project saved successfully');
      } else {
        setShowSaveDialog(true);
      }
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  return (
    <>
      <Button
        onClick={handleSave}
        disabled={isSavingProject || currentProject.isSaved}
        variant={currentProject.isSaved ? "outline" : "default"}
      >
        {isSavingProject ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {currentProject.id ? 'Save' : 'Save As...'}
      </Button>

      <CreateProjectDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={async (name, description) => {
          await actions.createProject(name, description);
          setShowSaveDialog(false);
          toast.success('Project created and saved');
        }}
      />
    </>
  );
}
```

### Project List Dialog

**File:** `src/components/project-management/ProjectListDialog.tsx`

```typescript
export function ProjectListDialog({ open, onOpenChange }: ProjectListDialogProps) {
  const { data: projects, isLoading } = trpc.project.list.useQuery({
    limit: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const { actions } = useVideoEditorStore();

  const handleLoadProject = async (projectId: string) => {
    try {
      await actions.loadProject(projectId);
      onOpenChange(false);
      toast.success('Project loaded successfully');
    } catch (error) {
      toast.error('Failed to load project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Load Project</DialogTitle>
          <DialogDescription>
            Select a project to load into the editor
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onLoad={() => handleLoadProject(project.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Export System Updates

### Updated Export Data Preparation

**File:** `src/lib/services/remotion-lambda.ts`

```typescript
/**
 * Prepares export data with S3 URLs for Remotion Lambda
 */
export function prepareCloudExportData(
  timelineElements: TimelineElement[],
  aspectRatio: string,
  duration: number
): VideoExportData {
  const clips: TimelineClip[] = timelineElements.map(element => ({
    id: element.id,
    type: element.type,
    startTime: element.startTime,
    endTime: element.startTime + element.duration,
    duration: element.duration,
    trackId: element.track.toString(),
    
    // Use S3 URL for media files
    src: element.mediaFile?.url, // This is now the S3 URL
    
    // For text elements
    content: element.type === 'text' ? element.properties?.text : undefined,
    
    // Pass through all properties
    properties: element.properties,
  }));

  return {
    clips,
    aspectRatio,
    fps: 30,
    duration,
  };
}
```

## Implementation Timeline

### Phase 1: Database Setup (Week 1)
1. Create database schema files
2. Run migrations
3. Update tRPC root router
4. Test database connections

### Phase 2: Basic Project CRUD (Week 2)
1. Implement project tRPC router
2. Create basic project management UI
3. Test project creation and loading
4. Implement project listing

### Phase 3: File Upload Integration (Week 3)
1. Implement S3 upload utilities
2. Update media upload flow
3. Test file persistence
4. Handle file deletion

### Phase 4: Timeline Persistence (Week 4)
1. Implement timeline element saving
2. Test complex project loading
3. Handle edge cases
4. Performance optimization

### Phase 5: UI Polish & Testing (Week 5)
1. Complete UI components
2. Add loading states
3. Error handling
4. User testing

## Security Considerations

### Access Control
- All project operations require authentication
- Users can only access their own projects
- File uploads are scoped to user's projects
- S3 files are private by default

### Data Validation
- All inputs are validated using Zod schemas
- File types are restricted to supported formats
- File sizes are limited to prevent abuse
- Project names and descriptions are sanitized

### Rate Limiting
- Implement rate limiting on project operations
- Limit file upload frequency
- Prevent spam project creation

## Performance Optimizations

### Database Optimizations
- Index frequently queried columns (userId, createdAt, updatedAt)
- Use database pagination for project lists
- Implement soft deletes for project recovery
- Regular database maintenance

### File Upload Optimizations
- Implement chunked uploads for large files
- Add upload progress indicators
- Compress images before upload
- Use CDN for faster file access

### Caching Strategy
- Cache project lists in React Query
- Implement optimistic updates for better UX
- Cache media file metadata
- Use service worker for offline capabilities

### Auto-save Implementation
```typescript
// Auto-save every 30 seconds if project has changes
useEffect(() => {
  if (!currentProject.isSaved && currentProject.id) {
    const autoSaveTimer = setInterval(() => {
      actions.saveProject().catch(console.error);
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }
}, [currentProject.isSaved, currentProject.id]);
```

This comprehensive implementation plan will transform Dreamreel into a fully cloud-based video editing platform while maintaining the responsive client-side editing experience users expect.