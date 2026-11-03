import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { Friend, FriendRequest, User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean; // infinite-scroll
      nextCursor?: string | null; // phân trang
    }
  >;
  activeConversationId: string | null;
  convoLoading: boolean;
  messageLoading: boolean;
  loading: boolean;
  pinnedMessages: Message[];
  replyingTo: Message | null;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversationById: (convoId: string) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
    replyTo?: string | null,
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
    replyTo?: string | null,
  ) => Promise<void>;
  // add message
  addMessage: (message: Message) => Promise<void>;
  // update convo
  updateConversation: (conversation: Conversation) => void;
  markAsSeen: () => Promise<void>;
  addConvo: (convo: Conversation) => void;
  createConversation: (
    type: "group" | "direct",
    name: string,
    memberIds: string[]
  ) => Promise<void>;
  hideConversation: (convoId: string) => Promise<void>;
  leaveConversation: (convoId: string) => Promise<void>;
  muteConversation: (convoId: string, mutedUntil?: Date | null) => Promise<void>;
  fetchPinnedMessages: (convoId: string) => Promise<void>; 
  pinMessage: (message: Message) => Promise<void>;         
  unpinMessage: (messageId: string) => Promise<void>;
  hideMessage: (messageId: string, conversationId: string) => Promise<void>;
  recallMessage: (messageId: string) => Promise<void>;
  setReplyingTo: (message: Message | null) => void
}

export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}

type AddFriendResult = {
  resultMessage: string;
  status: "success" | "error";
};
 
export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  unreadRequestCount: number;
  isRequestDialogOpen: boolean; // flag để socket biết dialog có đang mở không
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<AddFriendResult>;
  getAllFriendRequests: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
  addReceivedRequest: (request: FriendRequest) => void;
  addFriendToList: (friend: Friend) => void;
}

export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>;
}
