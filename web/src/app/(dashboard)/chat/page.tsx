"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConversationItem } from "@/components/chat/conversation-item";
import { MessageBubble } from "@/components/chat/message-bubble";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import api, { apiEndpoints, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
}

interface ApiConversation {
  id: string;
  participants: Array<{
    userId: number;
    user: { firstName: string; lastName: string; avatar?: string };
  }>;
  lastMessage?: { content: string; createdAt: string; senderId: number };
  unreadCount: number;
  createdAt: string;
}

interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  messageType: "text" | "image" | "file";
  mediaUrl?: string;
  createdAt: string;
  readAt?: string;
}

function mapConversation(conv: ApiConversation, isActive: boolean) {
  return {
    id: conv.id,
    participants: conv.participants.map((p) => ({
      userId: String(p.userId),
      name: `${p.user.firstName} ${p.user.lastName}`,
      profilePhotoUrl: p.user.avatar,
      isOnline: false,
    })),
    lastMessage: conv.lastMessage
      ? {
          id: `last-${conv.id}`,
          content: conv.lastMessage.content,
          messageType: "text" as const,
          createdAt: conv.lastMessage.createdAt,
        }
      : undefined,
    unreadCount: conv.unreadCount,
    isActive,
  };
}

function mapMessage(msg: ApiMessage): ChatMessage {
  return {
    id: msg.id,
    content: msg.content,
    messageType: msg.messageType === "file" ? "file" : msg.messageType,
    attachmentUrl: msg.mediaUrl,
    isRead: !!msg.readAt,
    createdAt: msg.createdAt,
    senderId: String(msg.senderId),
  };
}

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id;

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const res = await api.get(apiEndpoints.messages.conversations, {
        params: { page: 1, limit: 20 },
      });
      const data = res.data.data ?? res.data;
      setConversations(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setMessagesLoading(true);
      const res = await api.get(
        `${apiEndpoints.messages.conversation(convId)}/messages`,
        { params: { page: 1, limit: 50 } }
      );
      const data = res.data.data ?? res.data;
      const list = Array.isArray(data) ? data : data.data ?? [];
      setMessages(list.map(mapMessage));
    } catch (error) {
      toast.error(getErrorMessage(error));
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleSelectConversation = (convId: string) => {
    setSelectedConv(convId);
    setMessages([]);
    fetchMessages(convId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConv || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setShowEmojiPicker(false);

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      messageType: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: currentUserId ?? "",
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSending(true);
      const res = await api.post(apiEndpoints.messages.base, {
        conversationId: selectedConv,
        content,
        messageType: "text",
      });
      const sentMsg = mapMessage(res.data.data ?? res.data);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sentMsg : m))
      );
      fetchConversations();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "✨", "💫", "🙌", "😍", "🤗", "💪"];

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const name = conv.participants[0]?.user
      ? `${conv.participants[0].user.firstName} ${conv.participants[0].user.lastName}`
      : "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConvData = conversations.find((c) => c.id === selectedConv);
  const otherParticipant = selectedConvData?.participants[0];
  const otherName = otherParticipant
    ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
    : "";
  const otherAvatar = otherParticipant?.user.avatar;

  if (isMobile && selectedConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherAvatar ?? ""} alt={otherName} />
            <AvatarFallback>{getInitials(otherName ?? "?")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{otherName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => toast.success('Call feature coming soon')}><Phone className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => toast.success('Call feature coming soon')}><Video className="h-4 w-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={String(msg.senderId) === String(currentUserId)}
              />
            ))
          )}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-background">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-20"
              />
              <div className="absolute right-2 bottom-1.5 flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFileUpload}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="flex flex-wrap gap-1 mt-2 p-2 border rounded-lg bg-background">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className="text-lg hover:bg-accent rounded p-1"
                  onClick={() => setMessageInput((prev) => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col bg-background ${selectedConv && isMobile ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No conversations found
              </div>
            ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={mapConversation(conv, conv.id === selectedConv)}
                isActive={conv.id === selectedConv}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
            )
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-background ${!selectedConv && isMobile ? "hidden md:flex" : "flex"}`}>
        {selectedConv && selectedConvData ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherAvatar ?? ""} alt={otherName} />
                <AvatarFallback>{getInitials(otherName ?? "?")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{otherName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toast.success('Call feature coming soon')}><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toast.success('Call feature coming soon')}><Video className="h-4 w-4" /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.success('View profile feature coming soon')}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success('Block user feature coming soon')}>Block User</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => toast.success('Report feature coming soon')}>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                messages.map((msg, i) => {
                  const prevMsg = messages[i - 1];
                  const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={String(msg.senderId) === String(currentUserId)}
                      senderName={String(msg.senderId) === String(currentUserId) ? "You" : otherName}
                      showSender={showSender}
                    />
                  );
                })
              )}
              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[8px]">{getInitials(otherName ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs">typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-16"
                  />
                  <div className="absolute right-2 bottom-1.5 flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFileUpload}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-1 mt-2 p-2 border rounded-lg bg-background">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg hover:bg-accent rounded p-1"
                      onClick={() => setMessageInput((prev) => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select a conversation to start chatting or browse profiles to find new connections.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
