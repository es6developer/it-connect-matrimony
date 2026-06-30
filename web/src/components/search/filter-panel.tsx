"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  RELIGIOUS_BACKGROUNDS,
  MARITAL_STATUSES,
  TECH_CATEGORIES,
  TECH_SKILLS_BY_CATEGORY,
  INDIAN_STATES,
  INDIAN_LANGUAGES,
} from "@/constants";

export interface FilterValues {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  religion?: string[];
  community?: string;
  techSkills?: string[];
  company?: string;
  designation?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  workMode?: string;
  education?: string;
  maritalStatus?: string[];
  hasPhotos?: boolean;
  languages?: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

const workModes = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    basic: boolean; professional: boolean; tech: boolean; background: boolean;
  }>({
    basic: true,
    professional: false,
    tech: false,
    background: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFilter = (key: keyof FilterValues, value: unknown) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "religion" | "maritalStatus" | "techSkills" | "languages", value: string) => {
    const current = (filters[key] as string[]) ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l z-50 flex flex-col lg:sticky lg:top-0 lg:z-0 lg:max-w-xs xl:max-w-sm"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h2 className="font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
                  Reset
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Basic Section */}
                <FilterSection
                  title="Basic"
                  isExpanded={expandedSections.basic}
                  onToggle={() => toggleSection("basic")}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Age From</Label>
                      <select
                        value={String(filters.ageMin ?? "")}
                        onChange={(e) => updateFilter("ageMin", e.target.value ? Number(e.target.value) : undefined)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Min</option>
                        {Array.from({ length: 53 }, (_, i) => i + 18).map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Age To</Label>
                      <select
                        value={String(filters.ageMax ?? "")}
                        onChange={(e) => updateFilter("ageMax", e.target.value ? Number(e.target.value) : undefined)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Max</option>
                        {Array.from({ length: 53 }, (_, i) => i + 18).map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Location</Label>
                    <select
                      value={filters.location ?? ""}
                      onChange={(e) => updateFilter("location", e.target.value || undefined)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                    >
                      <option value="">Select city/state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Marital Status</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {MARITAL_STATUSES.map((status) => (
                        <label key={status.value} className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={filters.maritalStatus?.includes(status.value) ?? false}
                            onCheckedChange={() => toggleArrayFilter("maritalStatus", status.value)}
                          />
                          <span className="text-xs">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <Checkbox
                        id="hasPhotos"
                        checked={filters.hasPhotos ?? false}
                        onCheckedChange={() => updateFilter("hasPhotos", !filters.hasPhotos)}
                      />
                    <Label htmlFor="hasPhotos" className="text-xs cursor-pointer">Has Photos</Label>
                  </div>
                </FilterSection>

                {/* Religion Section */}
                <FilterSection
                  title="Background"
                  isExpanded={expandedSections.background}
                  onToggle={() => toggleSection("background")}
                >
                  <Label className="text-xs">Religion</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {RELIGIOUS_BACKGROUNDS.map((rel) => (
                      <label key={rel.value} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={filters.religion?.includes(rel.value) ?? false}
                          onCheckedChange={() => toggleArrayFilter("religion", rel.value)}
                        />
                        <span className="text-xs">{rel.label}</span>
                      </label>
                    ))}
                  </div>

                    <div className="mt-2">
                      <Label className="text-xs">Languages</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {INDIAN_LANGUAGES.slice(0, 8).map((lang) => (
                          <label key={lang} className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={filters.languages?.includes(lang) ?? false}
                              onCheckedChange={() => toggleArrayFilter("languages", lang)}
                            />
                            <span className="text-xs">{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                </FilterSection>

                {/* Professional Section */}
                <FilterSection
                  title="Professional"
                  isExpanded={expandedSections.professional}
                  onToggle={() => toggleSection("professional")}
                >
                  <div>
                    <Label className="text-xs">Company</Label>
                    <Input
                      placeholder="e.g. Google, Microsoft"
                      value={filters.company ?? ""}
                      onChange={(e) => updateFilter("company", e.target.value || undefined)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Designation</Label>
                    <Input
                      placeholder="e.g. Frontend Engineer"
                      value={filters.designation ?? ""}
                      onChange={(e) => updateFilter("designation", e.target.value || undefined)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Exp From</Label>
                      <select
                        value={String(filters.experienceMin ?? "")}
                        onChange={(e) => updateFilter("experienceMin", e.target.value ? Number(e.target.value) : undefined)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Min</option>
                        {Array.from({ length: 16 }, (_, i) => i).map((y) => (
                          <option key={y} value={y}>{y} yrs</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Exp To</Label>
                      <select
                        value={String(filters.experienceMax ?? "")}
                        onChange={(e) => updateFilter("experienceMax", e.target.value ? Number(e.target.value) : undefined)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="">Max</option>
                        {Array.from({ length: 16 }, (_, i) => i).map((y) => (
                          <option key={y} value={y}>{y} yrs</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Work Mode</Label>
                    <select
                      value={filters.workMode ?? ""}
                      onChange={(e) => updateFilter("workMode", e.target.value || undefined)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1"
                    >
                      <option value="">Select mode</option>
                      {workModes.map((mode) => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Education</Label>
                    <Input
                      placeholder="e.g. B.Tech, MCA"
                      value={filters.education ?? ""}
                      onChange={(e) => updateFilter("education", e.target.value || undefined)}
                    />
                  </div>
                </FilterSection>

                {/* Tech Skills Section */}
                <FilterSection
                  title="Tech Stack"
                  isExpanded={expandedSections.tech}
                  onToggle={() => toggleSection("tech")}
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    Select technologies you&apos;re looking for
                  </p>
                  <div className="space-y-3">
                    {TECH_CATEGORIES.slice(0, 8).map((cat) => {
                      const skills = TECH_SKILLS_BY_CATEGORY[cat.value] ?? [];
                      return (
                        <details key={cat.value} className="group">
                          <summary className="text-xs font-medium cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                            {cat.label}
                          </summary>
                          <div className="flex flex-wrap gap-1.5 mt-1 ml-4">
                            {skills.slice(0, 6).map((skill) => (
                              <button
                                key={skill}
                                onClick={() => toggleArrayFilter("techSkills", skill)}
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                                  filters.techSkills?.includes(skill)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                )}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                  {filters.techSkills && filters.techSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.techSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-[10px] cursor-pointer"
                          onClick={() => toggleArrayFilter("techSkills", skill)}
                        >
                          {skill} &times;
                        </Badge>
                      ))}
                    </div>
                  )}
                </FilterSection>
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onReset}>
                Reset All
              </Button>
              <Button className="flex-1 gap-2" onClick={onApply}>
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">{children}</div>
      )}
    </div>
  );
}
