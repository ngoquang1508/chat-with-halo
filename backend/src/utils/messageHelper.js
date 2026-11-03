export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId
) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      sender: message.senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;

    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};

export const emitNewMessage = (io, conversation, message, sender) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: {
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          _id: sender._id,
          displayName: sender.displayName,
          avatarUrl: sender.avatarUrl,
        },
      },
      lastMessageAt: message.createdAt,
    },
    unreadCounts: Object.fromEntries(conversation.unreadCounts),
  });
};