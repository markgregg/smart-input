import { CommitItem } from '@smart-input/core';
import './Message.css';

interface MessageProps {
  items: CommitItem[];
  timestamp: number;
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('zip') || type.includes('archive')) return '🗜️';
  return '📎';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function Message({ items, timestamp }: MessageProps) {
  return (
    <div className="message">
      <div className="message-content">
        {items.map((item, idx) => {
          // Text item
          if (typeof item === 'string') {
            return (
              <span key={idx} className="message-text-inline">
                {item}
              </span>
            );
          }

          // Block item
          const block = item;

          // Image block
          if (block.type === 'image') {
            return (
              <div key={idx} className="message-image-block">
                <img
                  src={block.url}
                  alt={block.alt || block.name || 'Image'}
                  className="message-image"
                />
                {block.alt && <div className="image-caption">{block.alt}</div>}
              </div>
            );
          }

          // Document block
          if (block.type === 'document') {
            return (
              <div key={idx} className="message-file-block">
                <span className="file-icon">
                  {getFileIcon(block.file.type)}
                </span>
                <div className="file-info">
                  <div className="file-name">{block.name}</div>
                  <div className="file-size">
                    {formatFileSize(block.file.size)}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
      <div className="message-time">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default Message;
