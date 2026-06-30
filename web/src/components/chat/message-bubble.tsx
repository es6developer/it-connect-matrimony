"use client";

import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Check, CheckCheck, FileText, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  messageType: "text" | "image" | "video" | "audio" | "file";
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showSender?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
  senderAvatar,
  showSender = true,
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2 max-w-[85%] md:max-w-[70%]", isOwn ? "ml-auto flex-row-reverse" : "")}
    >
      {showSender && (
        <Avatar className="h-8 w-8 mt-1 shrink-0">
          <AvatarImage src={senderAvatar ?? ""} alt={senderName ?? ""} />
          <AvatarFallback className="text-[10px]">{getInitials(senderName ?? "?")}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {showSender && senderName && (
          <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
            {senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 break-words",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-muted text-foreground rounded-tl-md"
          )}
        >
          {message.messageType === "text" && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
          {message.messageType === "image" && message.attachmentUrl && (
            <div className="space-y-1">
              <img
                src={message.attachmentUrl}
                alt="Shared image"
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              />
              {message.content && (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          )}
          {message.messageType === "video" && message.attachmentUrl && (
            <div className="space-y-1">
              <div className="relative rounded-lg overflow-hidden bg-black/10">
                <video src={message.attachmentUrl} className="max-w-full rounded-lg" controls />
              </div>
              {message.content && (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          )}
          {message.messageType === "audio" && message.attachmentUrl && (
            <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2 min-w-[200px]">
              <Mic className="h-4 w-4 shrink-0" />
              <audio src={message.attachmentUrl} controls className="h-8 max-w-full" />
            </div>
          )}
          {message.messageType === "file" && message.attachmentUrl && (
            <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
              <FileText className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <a
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2 truncate block"
                >
                  {message.content || "Download file"}
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(message.createdAt)}
          </span>
          {isOwn && (
            message.isRead
              ? <CheckCheck className="h-3 w-3 text-blue-500" />
              : <Check className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
