import './UserMention.css';

interface UserMentionProps {
  name: string;
  username: string;
  avatar: string;
  role: string;
}

function UserMention({ name, username, avatar, role }: UserMentionProps) {
  return (
    <span className="user-mention" title={`${name} - ${role}`}>
      <span className="mention-avatar">{avatar}</span>
      <span className="mention-username">@{username}</span>
    </span>
  );
}

export default UserMention;
