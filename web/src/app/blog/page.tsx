"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Cpu,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const posts = [
  {
    slug: "finding-love-in-tech",
    title: "Finding Love in the Tech World: A Developer's Guide",
    excerpt: "Navigating relationships as a software engineer comes with unique challenges. Here's how to find your perfect match.",
    category: "Relationships",
    author: "Arun Sharma",
    authorRole: "CEO & Co-Founder",
    date: "June 28, 2026",
    readTime: "5 min read",
    image: "",
    tags: ["Relationships", "Tech Life", "Advice"],
  },
  {
    slug: "ai-matchmaking-explained",
    title: "How AI is Revolutionizing Matchmaking for IT Professionals",
    excerpt: "Discover how our compatibility algorithm analyzes tech stacks, career paths, and interests to find your perfect match.",
    category: "Technology",
    author: "Priya Patel",
    authorRole: "CTO & Co-Founder",
    date: "June 25, 2026",
    readTime: "7 min read",
    image: "",
    tags: ["AI", "Technology", "Matchmaking"],
  },
  {
    slug: "success-story-priya-arjun",
    title: "Success Story: How Priya and Arjun Found Their Perfect Match",
    excerpt: "Two backend developers who found love through shared code reviews and a mutual love for Python.",
    category: "Success Stories",
    author: "Sanya Kapoor",
    authorRole: "Head of Engineering",
    date: "June 20, 2026",
    readTime: "4 min read",
    image: "",
    tags: ["Success Stories", "Couples"],
  },
  {
    slug: "building-perfect-profile",
    title: "Building the Perfect IT Matrimony Profile: Tips & Tricks",
    excerpt: "Learn how to showcase your tech skills and personality to attract the right matches.",
    category: "Tips",
    author: "Rahul Verma",
    authorRole: "Head of Product",
    date: "June 15, 2026",
    readTime: "6 min read",
    image: "",
    tags: ["Tips", "Profile", "Advice"],
  },
  {
    slug: "remote-work-relationships",
    title: "Remote Work and Relationships: Finding Balance in Tech",
    excerpt: "How remote-first tech professionals can build and maintain meaningful relationships.",
    category: "Lifestyle",
    author: "Arun Sharma",
    authorRole: "CEO & Co-Founder",
    date: "June 10, 2026",
    readTime: "5 min read",
    image: "",
    tags: ["Remote Work", "Lifestyle", "Relationships"],
  },
  {
    slug: "tech-stack-compatibility",
    title: "Tech Stack Compatibility: Does It Really Matter in Relationships?",
    excerpt: "We analyzed thousands of matches to understand the role of tech compatibility in successful relationships.",
    category: "Research",
    author: "Priya Patel",
    authorRole: "CTO & Co-Founder",
    date: "June 5, 2026",
    readTime: "8 min read",
    image: "",
    tags: ["Research", "Tech Stack", "Compatibility"],
  },
];

const categories = ["All", "Relationships", "Technology", "Success Stories", "Tips", "Lifestyle", "Research"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-rose-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              IT Connect <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stories, insights, and advice for IT professionals looking for love.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-9 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="group h-full hover:border-primary/30 transition-all duration-200 hover:shadow-lg overflow-hidden">
                    <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Cpu className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {post.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 mt-1">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px]">
                              {post.author.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{post.author}</p>
                            <p className="text-[10px] text-muted-foreground">{post.date}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" className="gap-2">
            Load More Articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
