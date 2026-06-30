"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Save,
  BellRing,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/profile/profile-card";
import { FilterPanel, FilterValues } from "@/components/search/filter-panel";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaQuery } from "@/hooks/use-media-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SearchResult {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile?: { gender: string; age: number; city: string; state: string; about: string };
  professionalDetail?: { companyName: string; jobTitle: string; techStack: string[] };
}

interface PaginatedResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const defaultFilters: FilterValues = {};

function transformResult(r: SearchResult) {
  return {
    id: r.uuid,
    name: `${r.firstName} ${r.lastName}`,
    age: r.profile?.age ?? 0,
    location: [r.profile?.city, r.profile?.state].filter(Boolean).join(", ") || "Location not set",
    role: r.professionalDetail?.jobTitle ?? r.role,
    company: r.professionalDetail?.companyName,
    techStack: r.professionalDetail?.techStack,
  };
}

export default function SearchPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sendingInterest, setSendingInterest] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: 20,
        };
        if (debouncedSearch) params.q = debouncedSearch;
        if (filters.ageMin) params.ageMin = filters.ageMin;
        if (filters.ageMax) params.ageMax = filters.ageMax;
        if (filters.location) params.city = filters.location;

        const res = await api.get<PaginatedResponse>("/api/v1/search", { params });
        setResults(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch {
        setError("Failed to load search results. Please try again.");
        setResults([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch, filters, currentPage]);

  async function handleSendInterest(uuid: string) {
    if (sendingInterest.has(uuid)) return;
    setSendingInterest((prev) => new Set(prev).add(uuid));
    try {
      await api.post("/api/v1/interests/send", { toUserId: uuid });
      toast.success("Interest sent successfully!");
    } catch {
      toast.error("Failed to send interest. Please try again.");
    } finally {
      setSendingInterest((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    }
  }

  async function handleSaveSearch() {
    const name = window.prompt("Enter a name for this search:");
    if (!name?.trim()) return;

    try {
      await api.post("/api/v1/search/saved", {
        name: name.trim(),
        filters: { ...filters, q: searchQuery || undefined },
      });
      toast.success("Search saved successfully!");
    } catch {
      toast.error("Failed to save search. Please try again.");
    }
  }

  const profiles = results.map(transformResult);

  return (
    <div className="flex gap-6 h-[calc(100vh-5rem)]">
      <FilterPanel
        isOpen={isDesktop ? true : filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilterChange={(f) => {
          setFilters(f);
          setCurrentPage(1);
        }}
        onApply={() => setFiltersOpen(false)}
        onReset={() => {
          setFilters(defaultFilters);
          setCurrentPage(1);
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Search Members</h1>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, tech stack..."
                className="pl-9 h-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="gap-2 lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveSearch}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {isLoading ? "Searching..." : `${total} members found`}
            </p>
            <div className="flex items-center gap-2">
              <BellRing className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">
                Get notified about new matches
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            )
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No members found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Try adjusting your search criteria or filters to find more members.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilters(defaultFilters);
                  setCurrentPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      viewMode="grid"
                      onSendInterest={() => handleSendInterest(profile.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      viewMode="list"
                      onSendInterest={() => handleSendInterest(profile.id)}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 pb-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
