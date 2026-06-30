"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
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
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "@/components/chat/message-bubble";
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

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserAvatar, setOtherUserAvatar] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      const [convRes, msgRes] = await Promise.all([
        api.get(apiEndpoints.messages.conversation(conversationId)),
        api.get(`${apiEndpoints.messages.conversation(conversationId)}/messages`, {
          params: { page: 1, limit: 50 },
        }),
      ]);

      const conv = convRes.data.data ?? convRes.data;
      const p = conv.participants?.[0];
      if (p) {
        setOtherUserName(`${p.user.firstName} ${p.user.lastName}`);
        setOtherUserAvatar(p.user.avatar ?? "");
      }

      const msgData = msgRes.data.data ?? msgRes.data;
      const msgList = Array.isArray(msgData) ? msgData : msgData.data ?? [];
      setMessages(msgList.map(mapMessage));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setShowEmojiPicker(false);

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      messageType: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: currentUserId ?? "",
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      setSending(true);
      const res = await api.post(apiEndpoints.messages.base, {
        conversationId,
        content,
        messageType: "text",
      });
      const sent = mapMessage(res.data.data ?? res.data);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? sent : m))
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "✨", "💫", "🙌", "😍", "🤗", "💪"];

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className={`h-16 w-3/4 rounded-2xl ${i % 2 === 0 ? "rounded-tl-md" : "rounded-tr-md"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={otherUserAvatar} alt={otherUserName} />
          <AvatarFallback>{getInitials(otherUserName || "?")}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{otherUserName}</p>
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
        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1];
          const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={String(msg.senderId) === String(currentUserId)}
              senderName={String(msg.senderId) === String(currentUserId) ? "You" : otherUserName}
              showSender={showSender}
            />
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[8px]">{getInitials(otherUserName || "?")}</AvatarFallback>
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
                  handleSend();
                }
              }}
              className="pr-16"
            />
            <div className="absolute right-2 bottom-1.5 flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button size="icon" onClick={handleSend} disabled={!messageInput.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1 mt-2 p-2 border rounded-lg bg-background"
          >
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                className="text-lg hover:bg-accent rounded p-1 transition-colors"
                onClick={() => setMessageInput((prev) => prev + emoji)}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
        />
      </div>
    </div>
  );
}
