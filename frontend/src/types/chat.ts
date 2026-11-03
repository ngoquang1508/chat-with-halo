export interface Participant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string | null;
  isRecalled?: boolean;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface MutedBy {
  userId: string;
  mutedUntil: string | null; // null = vĩnh viễn
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  mutedBy: MutedBy[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface ReplyTo {
  senderName: string;
  _id: string;
  content: string | null;
  senderId: string;
  isRecalled: boolean;
}

export interface Message {
  isRecalled: boolean;
  _id: string;
  conversationId: string;
  type: "text" | "system";
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
  isPinned: boolean;
  pinnedBy: string;
  pinnedAt: Date;
  replyTo?: ReplyTo | null;
}
