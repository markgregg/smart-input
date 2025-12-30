import './TagBadge.css';

interface TagBadgeProps {
  name: string;
  color: string;
}

function TagBadge({ name, color }: TagBadgeProps) {
  return (
    <span className="tag-badge" style={{ backgroundColor: color }}>
      <span className="tag-hash">#</span>
      <span className="tag-name">{name}</span>
    </span>
  );
}

export default TagBadge;
