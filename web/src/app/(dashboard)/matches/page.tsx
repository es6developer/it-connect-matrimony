"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/matches/match-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface MatchedUser {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile?: {
    gender: string;
    age: number;
    city: string;
    state: string;
    about: string;
  };
  professionalDetail?: {
    companyName: string;
    jobTitle: string;
    techStack: string[];
  };
}

interface MatchData {
  id: number;
  uuid: string;
  userId: number;
  matchedUserId: number;
  compatibilityScore: number | null;
  aiScore: number | null;
  isMutual: boolean;
  matchedAt: string;
  isActive: boolean;
  matchedUser: MatchedUser;
}

interface MatchesResponse {
  data: MatchData[];
  total: number;
  page: number;
  limit: number;
}

export default function MatchesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<MatchesResponse>("/api/v1/matches", {
          params: { page: 1, limit: 50 },
        });
        setMatches(response.data.data);
      } catch {
        setError("Failed to load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return !match.isMutual;
    if (activeTab === "mutual") return match.isMutual;
    return true;
  });

  const handleSendInterest = async (id: string) => {
    const match = matches.find((m) => m.matchedUser.uuid === id);
    if (!match) return;
    try {
      await api.post("/api/v1/interests", {
        toUserId: match.matchedUserId,
      });
      toast.success("Interest sent!");
    } catch {
      // error toast handled by interceptor
    }
  };

  const handleViewProfile = (_id: string) => {
    router.push('/profile');
  };

  const mapMatchToProfile = (match: MatchData) => ({
    id: match.matchedUser.uuid,
    name: `${match.matchedUser.firstName} ${match.matchedUser.lastName}`,
    age: match.matchedUser.profile?.age ?? 0,
    location: [match.matchedUser.profile?.city, match.matchedUser.profile?.state]
      .filter(Boolean)
      .join(", "),
    role: [match.matchedUser.professionalDetail?.jobTitle, match.matchedUser.professionalDetail?.companyName]
      .filter(Boolean)
      .join(" at "),
    company: match.matchedUser.professionalDetail?.companyName,
    techStack: match.matchedUser.professionalDetail?.techStack,
    avatar: "",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const renderMatchGrid = (matchList: MatchData[]) => {
    if (matchList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Complete your profile and set your preferences to start getting matches.
          </p>
          <Link href="/search">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Discover Members
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {matchList.map((match) => {
          const profile = mapMatchToProfile(match);
          return (
            <MatchCard
              key={match.id}
              profile={profile}
              score={match.compatibilityScore ?? match.aiScore ?? 85}
              onSendInterest={handleSendInterest}
              onViewProfile={handleViewProfile}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
            <p className="text-muted-foreground mt-1">
              Discover your compatible tech matches
            </p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Discover
            </Button>
          </Link>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Heart className="h-4 w-4" />
            All Matches
            <Badge variant="secondary" className="ml-1 text-[10px] h-5">
              {matches.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Matches
            <Badge variant="secondary" className="ml-1 text-[10px] h-5">
              {matches.filter((m) => !m.isMutual).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="mutual" className="gap-2">
            <Users className="h-4 w-4" />
            Mutual Matches
            <Badge variant="secondary" className="ml-1 text-[10px] h-5">
              {matches.filter((m) => m.isMutual).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <TabsContent value="all" className="mt-0">
              {renderMatchGrid(filteredMatches)}
            </TabsContent>
            <TabsContent value="new" className="mt-0">
              {renderMatchGrid(filteredMatches)}
            </TabsContent>
            <TabsContent value="mutual" className="mt-0">
              {renderMatchGrid(filteredMatches)}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
