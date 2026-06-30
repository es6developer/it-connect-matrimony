"use client";

import { motion } from "framer-motion";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

interface ConversationParticipant {
  userId: string;
  name: string;
  profilePhotoUrl?: string;
  lastSeen?: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants[0];
  const hasUnread = conversation.unreadCount > 0;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
        isActive
          ? "bg-accent"
          : "hover:bg-accent/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherParticipant?.profilePhotoUrl ?? ""} alt={otherParticipant?.name ?? ""} />
          <AvatarFallback>{getInitials(otherParticipant?.name ?? "?")}</AvatarFallback>
        </Avatar>
        {otherParticipant?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{otherParticipant?.name}</span>
          {conversation.lastMessage && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatRelativeTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span
            className={cn(
              "text-xs truncate",
              hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {conversation.lastMessage
              ? truncate(
                  conversation.lastMessage.messageType !== "text"
                    ? `[${conversation.lastMessage.messageType}] ${conversation.lastMessage.content}`
                    : conversation.lastMessage.content,
                  50
                )
              : "No messages yet"}
          </span>
          {hasUnread && (
            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px] shrink-0">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  );
}
