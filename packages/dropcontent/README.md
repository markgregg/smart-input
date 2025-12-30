# @smart-input/dropcontent

A drag-and-drop content handler for the Open Input editor. Enables users to drop files and content directly into the editor with visual feedback and file processing.

## Features

- 📎 **File Drop Support** - Drop images, documents, and files
- 🎨 **Visual Feedback** - Highlight drop zones during drag operations
- 🖼️ **Image Processing** - Automatic image preview and embedding
- 📄 **Document Handling** - Support for various file types
- 🎯 **Custom Processing** - Flexible file processing callbacks
- 📊 **File Validation** - Size and type restrictions
- ♿ **Accessible** - Keyboard alternatives for file selection

## Installation

```bash
npm install @smart-input/dropcontent @smart-input/core zustand
# or
pnpm add @smart-input/dropcontent @smart-input/core zustand
# or
yarn add @smart-input/dropcontent @smart-input/core zustand
```

## Quick Start

### Basic Usage

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { DropContentHandler } from '@smart-input/dropcontent';
import '@smart-input/core/style.css';
import '@smart-input/dropcontent/style.css';

function App() {
  return (
    <SmartInput>
      <DropContentHandler>
        <Editor placeholder="Drop files here or type..." />
      </DropContentHandler>
    </SmartInput>
  );
}
```

## Props

### DropContentHandler

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | ReactNode | Yes | Editor component to wrap |
| `onDrop` | (files: File[]) => void | No | Callback when files are dropped |
| `onFileProcess` | (file: File) => Promise<Block \| Block[]> | No | Custom file processing function |
| `accept` | string | No | Accepted file types (e.g., 'image/*,application/pdf') |
| `maxSize` | number | No | Maximum file size in bytes |
| `maxFiles` | number | No | Maximum number of files per drop |
| `disabled` | boolean | No | Disable drop functionality |

## Examples

### Image Drops Only

```tsx
<DropContentHandler
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
>
  <Editor placeholder="Drop images here..." />
</DropContentHandler>
```

### Custom File Processing

```tsx
import { Block, BlockType } from '@smart-input/core';

async function processFile(file: File): Promise<Block> {
  if (file.type.startsWith('image/')) {
    const url = await uploadToServer(file);
    return {
      id: crypto.randomUUID(),
      type: BlockType.Image,
      url,
      alt: file.name
    };
  }
  
  return {
    id: crypto.randomUUID(),
    type: BlockType.Document,
    name: file.name,
    size: file.size,
    file
  };
}

<DropContentHandler onFileProcess={processFile}>
  <Editor placeholder="Drop any file..." />
</DropContentHandler>
```

### With Validation

```tsx
function handleDrop(files: File[]) {
  const invalidFiles = files.filter(file => 
    file.size > 10 * 1024 * 1024 // 10MB
  );
  
  if (invalidFiles.length > 0) {
    alert('Some files are too large (max 10MB)');
    return;
  }
  
  console.log('Valid files:', files);
}

<DropContentHandler 
  onDrop={handleDrop}
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
>
  <Editor />
</DropContentHandler>
```

### Multiple File Types

```tsx
<DropContentHandler
  accept="image/*,application/pdf,.doc,.docx"
  onFileProcess={async (file) => {
    if (file.type.startsWith('image/')) {
      return {
        id: crypto.randomUUID(),
        type: BlockType.Image,
        url: URL.createObjectURL(file),
        alt: file.name
      };
    }
    
    return {
      id: crypto.randomUUID(),
      type: BlockType.Document,
      name: file.name,
      size: file.size,
      file
    };
  }}
>
  <Editor placeholder="Drop images or documents..." />
</DropContentHandler>
```

### With Upload Progress

```tsx
import { useState } from 'react';

function UploaderApp() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadFile(file: File) {
    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadWithProgress(file, (p) => setProgress(p));
      
      return {
        id: crypto.randomUUID(),
        type: BlockType.Image,
        url,
        alt: file.name
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div>
      {uploading && <div>Uploading: {progress}%</div>}
      
      <SmartInput>
        <DropContentHandler onFileProcess={uploadFile}>
          <Editor 
            placeholder="Drop files to upload..."
            readOnly={uploading}
          />
        </DropContentHandler>
      </SmartInput>
    </div>
  );
}
```

## How It Works

1. **Drag Over**: When files are dragged over the editor, the drop zone is highlighted
2. **Visual Feedback**: The editor shows a visual indication that it can accept drops
3. **Drop**: When files are dropped, they are processed based on type
4. **Block Creation**: Files are converted to appropriate block types:
   - Images → `ImageBlock` with preview
   - Documents → `DocumentBlock` with file info
   - Custom → Your `onFileProcess` handler

## Default File Processing

By default, files are processed as follows:

- **Images** (`image/*`): Created as `ImageBlock` with data URL
- **Other files**: Created as `DocumentBlock` with file metadata

## Visual Feedback

The component provides visual feedback during drag operations:

- Drop zone highlights when dragging files over
- Cursor changes to indicate drop capability
- Animations for smooth user experience

Import the default styles:

```tsx
import '@smart-input/dropcontent/style.css';
```

## Styling

Customize with CSS classes:

- `.drop-zone` - Drop zone container
- `.drop-zone--active` - Active during drag over
- `.drop-indicator` - Visual drop indicator

Example custom styles:

```css
.drop-zone--active {
  background-color: #f0f7ff;
  border: 2px dashed #2196f3;
  border-radius: 8px;
}

.drop-indicator {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}
```

## File Type Detection

The handler automatically detects file types:

```typescript
// Image files
if (file.type.startsWith('image/')) {
  // Process as image
}

// PDF documents
if (file.type === 'application/pdf') {
  // Process as PDF
}

// Word documents
if (file.type.includes('word') || file.name.endsWith('.doc')) {
  // Process as Word doc
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type { 
  DropContentHandlerProps,
  FileProcessFunction
} from '@smart-input/dropcontent';

const processFile: FileProcessFunction = async (file) => {
  return {
    id: crypto.randomUUID(),
    type: BlockType.Image,
    url: URL.createObjectURL(file)
  };
};

const props: DropContentHandlerProps = {
  children: <Editor />,
  onFileProcess: processFile,
  accept: 'image/*',
  maxSize: 5242880 // 5MB
};
```

## Advanced Examples

### With Image Compression

```tsx
import imageCompression from 'browser-image-compression';

async function processImage(file: File): Promise<Block> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920
  };
  
  const compressed = await imageCompression(file, options);
  const url = URL.createObjectURL(compressed);
  
  return {
    id: crypto.randomUUID(),
    type: BlockType.Image,
    url,
    alt: file.name
  };
}

<DropContentHandler onFileProcess={processImage}>
  <Editor />
</DropContentHandler>
```

### With Cloud Upload

```tsx
async function uploadToCloud(file: File): Promise<Block> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url, id } = await response.json();
  
  if (file.type.startsWith('image/')) {
    return {
      id,
      type: BlockType.Image,
      url,
      alt: file.name
    };
  }
  
  return {
    id,
    type: BlockType.Document,
    name: file.name,
    size: file.size,
    url
  };
}

<DropContentHandler onFileProcess={uploadToCloud}>
  <Editor placeholder="Drop files to upload to cloud..." />
</DropContentHandler>
```

### Multiple Blocks from Single File

```tsx
async function processMultiple(file: File): Promise<Block[]> {
  // Return multiple blocks for a single file
  return [
    {
      id: crypto.randomUUID(),
      type: BlockType.Text,
      text: `Uploading ${file.name}...`
    },
    {
      id: crypto.randomUUID(),
      type: BlockType.Document,
      name: file.name,
      size: file.size,
      file
    }
  ];
}

<DropContentHandler onFileProcess={processMultiple}>
  <Editor />
</DropContentHandler>
```

## Accessibility

For keyboard accessibility, consider adding a file input button:

```tsx
function AccessibleDropZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    // Process files
  };

  return (
    <div>
      <SmartInput>
        <DropContentHandler>
          <Editor placeholder="Drop files or click to select..." />
        </DropContentHandler>
      </SmartInput>

      <button onClick={() => fileInputRef.current?.click()}>
        Select Files
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
}
```

## Best Practices

1. **Validate file types** - Use the `accept` prop to restrict file types
2. **Limit file sizes** - Set `maxSize` to prevent large uploads
3. **Provide feedback** - Show progress for uploads
4. **Handle errors** - Catch and display upload errors
5. **Compress images** - Reduce image sizes before upload
6. **Clean up URLs** - Revoke object URLs when no longer needed

## Browser Support

The component uses the HTML5 Drag and Drop API, which is supported in:

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari 3.1+
- ✅ Opera 12+

## Documentation

For more information, see:

- **[User Guide](../../docs/USER_GUIDE.md)** - Complete usage guide
- **[Component Reference](../../docs/COMPONENTS.md)** - Component details
- **[Extension Development](../../docs/EXTENSION_DEVELOPMENT.md)** - Creating extensions

## Requirements

- React 18.0.0 or higher
- @smart-input/core 1.0.0 or higher
- zustand 5.0.0 or higher

## License

MIT © Mark Gregg
