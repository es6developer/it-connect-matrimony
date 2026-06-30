"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Section {
  key: string;
  label: string;
  completed: boolean;
}

interface ProfileCompletionProps {
  percentage: number;
  sections?: Section[];
  onSectionClick?: (key: string) => void;
}

const defaultSections: Section[] = [
  { key: "basic", label: "Basic Details", completed: true },
  { key: "professional", label: "Professional Details", completed: true },
  { key: "education", label: "Education & Family", completed: false },
  { key: "lifestyle", label: "Lifestyle & Preferences", completed: false },
  { key: "photos", label: "Photos & Videos", completed: false },
];

export function ProfileCompletion({
  percentage,
  sections = defaultSections,
  onSectionClick,
}: ProfileCompletionProps) {
  const completedCount = sections.filter((s) => s.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Profile Completion</h3>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} indicatorColor="bg-gradient-to-r from-blue-500 to-purple-500" />
      <p className="text-xs text-muted-foreground">
        {completedCount} of {sections.length} sections completed
      </p>
      <div className="space-y-1">
        {sections.map((section, i) => (
          <motion.button
            key={section.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSectionClick?.(section.key)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              section.completed
                ? "text-muted-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                section.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border border-dashed border-muted-foreground/30"
              )}
            >
              {section.completed ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              )}
            </div>
            <span className="flex-1 text-left">{section.label}</span>
            {!section.completed && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
