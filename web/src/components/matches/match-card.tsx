"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, Code2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface MatchProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  role?: string;
  company?: string;
  techStack?: string[];
  avatar?: string;
  isOnline?: boolean;
  isVerified?: boolean;
}

interface MatchCardProps {
  profile: MatchProfile;
  score: number;
  compatibility?: {
    techStack: number;
    education: number;
    location: number;
    age: number;
    interests: number;
    background: number;
  };
  onSendInterest: (id: string) => void;
  onViewProfile: (id: string) => void;
  index?: number;
}

function CompatibilityRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeWidth = 4;

  const color =
    score >= 90 ? "#22c55e" :
    score >= 75 ? "#eab308" :
    score >= 60 ? "#f97316" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

export function MatchCard({
  profile,
  score,
  compatibility,
  onSendInterest,
  onViewProfile,
  index = 0,
}: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-lg overflow-hidden">
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              <AvatarImage src={profile.avatar ?? ""} alt={profile.name} />
              <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-10 right-4">
            <CompatibilityRing score={score} size={80} />
          </div>
          {profile.isOnline && (
            <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        <CardContent className="pt-12 pb-4 px-4">
          <div className="text-center mb-3">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {profile.name}, {profile.age}
            </h3>
            {profile.role && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Briefcase className="h-3 w-3" />
                {profile.role}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </p>
          </div>

          {profile.techStack && profile.techStack.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {profile.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 font-medium"
                >
                  <Code2 className="h-2.5 w-2.5" />
                  {tech}
                </span>
              ))}
              {profile.techStack.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{profile.techStack.length - 4}
                </span>
              )}
            </div>
          )}

          {compatibility && (
            <div className="grid grid-cols-3 gap-1 mb-3">
              {Object.entries(compatibility).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className="text-xs font-semibold capitalize">
                    {key === "techStack" ? "Tech" : key.slice(0, 4)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{val}%</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewProfile(profile.id)}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => onSendInterest(profile.id)}
            >
              <Heart className="h-3 w-3" />
              Interest
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { CompatibilityRing };
