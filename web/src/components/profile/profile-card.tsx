"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Briefcase, Code2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface ProfileCardProps {
  profile: {
    id?: string;
    name: string;
    age: number;
    location: string;
    role?: string;
    company?: string;
    techStack?: string[];
    matchScore?: number;
    avatar?: string;
    isOnline?: boolean;
    isVerified?: boolean;
  };
  viewMode?: "grid" | "list";
  onSendInterest?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

export function ProfileCard({
  profile,
  viewMode = "grid",
  onSendInterest,
  onViewProfile,
}: ProfileCardProps) {
  const id = profile.id ?? profile.name.toLowerCase().replace(/\s+/g, "-");

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarImage src={profile.avatar ?? ""} alt={profile.name} />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                {profile.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-primary transition-colors">
                      {profile.name}, {profile.age}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Briefcase className="h-3 w-3 shrink-0" />
                      <span className="truncate">{profile.role ?? profile.company}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {profile.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {profile.matchScore !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {profile.matchScore}% Match
                      </Badge>
                    )}
                    {profile.isVerified && (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {profile.techStack && profile.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 font-medium"
                      >
                        <Code2 className="h-2.5 w-2.5" />
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {onViewProfile && (
                  <Button variant="outline" size="sm" onClick={() => onViewProfile(id)}>
                    View
                  </Button>
                )}
                {onSendInterest && (
                  <Button size="sm" className="gap-1" onClick={() => onSendInterest(id)}>
                    <Heart className="h-3.5 w-3.5" />
                    Interest
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-lg overflow-hidden">
        <Link href={`/profile/${id}`}>
          <div className="relative">
            <div className="aspect-[3/4] bg-gradient-to-b from-muted to-muted/50 flex items-center justify-center">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={profile.avatar ?? ""} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            {profile.isOnline && (
              <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
            {profile.matchScore !== undefined && (
              <div className="absolute top-3 left-3">
                <div className="relative h-12 w-12">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none" stroke="hsl(var(--secondary))" strokeWidth="2"
                    />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke={
                        profile.matchScore >= 90 ? "#22c55e" :
                        profile.matchScore >= 70 ? "#eab308" : "#ef4444"
                      }
                      strokeWidth="2"
                      strokeDasharray={`${profile.matchScore * 0.97} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                    {profile.matchScore}%
                  </span>
                </div>
              </div>
            )}
            {profile.isVerified && (
              <Badge variant="success" className="absolute bottom-3 right-3 text-[10px]">
                Verified
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="p-4">
          <Link href={`/profile/${id}`}>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {profile.name}, {profile.age}
            </h3>
            {profile.role && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3 shrink-0" />
                {profile.role}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {profile.location}
            </p>
          </Link>
          {profile.techStack && profile.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 font-medium"
                >
                  <Code2 className="h-2.5 w-2.5" />
                  {tech}
                </span>
              ))}
              {profile.techStack.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{profile.techStack.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {onViewProfile && (
              <Button variant="outline" size="sm" className="flex-1 text-xs"
                onClick={(e) => { e.preventDefault(); onViewProfile(id); }}>
                View
              </Button>
            )}
            {onSendInterest && (
              <Button size="sm" className="flex-1 text-xs gap-1"
                onClick={(e) => { e.preventDefault(); onSendInterest(id); }}>
                <Heart className="h-3 w-3" />
                Interest
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
