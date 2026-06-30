"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Heart,
  Shield,
  Sparkles,
  Video,
  Globe,
  ArrowRight,
  Check,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Code2,
  Lock,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.1 },
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader>
          <div
            className={`h-12 w-12 rounded-xl ${gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

function StatCounter({
  end,
  label,
  suffix = "",
  duration = 2,
}: {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient mb-1">
        {count}
        {suffix}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Senior Frontend Engineer at Google",
    avatar: "",
    content:
      "IT Connect Matrimony understood exactly what I was looking for. The tech stack matching helped me find someone who shares my passion for React and open source.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Backend Developer at Amazon",
    avatar: "",
    content:
      "I was skeptical about online matrimony, but the verified profiles and intelligent matching made the experience seamless. Found my perfect match within a month!",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Data Scientist at Microsoft",
    avatar: "",
    content:
      "The privacy-first approach and detailed tech profiles set this apart. I loved that I could filter by tech stack and find someone who truly understands my world.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "DevOps Engineer at Netflix",
    avatar: "",
    content:
      "Finally a matrimony platform that speaks our language! From CI/CD pipelines to cloud architecture, finding someone who shares your tech interests is incredible.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Get started with basic matching",
    features: [
      "5 daily matches",
      "Basic profile search",
      "View profiles",
      "Limited filters",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "999",
    period: "/month",
    description: "Most popular for serious connections",
    features: [
      "20 daily matches",
      "Advanced search filters",
      "Send unlimited messages",
      "See who liked you",
      "Profile highlight badge",
      "Priority support",
    ],
    cta: "Go Premium",
    popular: true,
  },
  {
    name: "Platinum",
    price: "1,999",
    period: "/month",
    description: "For the best experience",
    features: [
      "50 daily matches",
      "All premium features",
      "Incognito mode",
      "Read receipts",
      "Priority support",
      "Premium profile badge",
    ],
    cta: "Go Platinum",
    popular: false,
  },
];

const techStackLogos = [
  { name: "React", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { name: "Python", color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "TypeScript", color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Node.js", color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Go", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { name: "Rust", color: "text-orange-600", bg: "bg-orange-600/10" },
  { name: "AWS", color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "Docker", color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Kubernetes", color: "text-blue-600", bg: "bg-blue-600/10" },
  { name: "Vue", color: "text-green-400", bg: "bg-green-400/10" },
  { name: "Angular", color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Swift", color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Kotlin", color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "MongoDB", color: "text-green-500", bg: "bg-green-500/10" },
  { name: "PostgreSQL", color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "GraphQL", color: "text-pink-500", bg: "bg-pink-500/10" },
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Profile",
    description:
      "Sign up and build a comprehensive profile showcasing your tech stack, experience, and what you're looking for.",
    icon: Code2,
  },
  {
    step: 2,
    title: "Set Your Preferences",
    description:
      "Define your ideal match by tech skills, career level, location, education, and lifestyle preferences.",
    icon: Heart,
  },
  {
    step: 3,
    title: "Get Smart Matches",
    description:
      "Our AI matches you with compatible IT professionals based on tech compatibility and shared interests.",
    icon: Cpu,
  },
  {
    step: 4,
    title: "Connect & Build",
    description:
      "Start conversations, share your tech journey, and build a meaningful relationship with your match.",
    icon: Video,
  },
];

export default function LandingPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="overflow-hidden">
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[90vh] flex items-center justify-center pt-16"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-rose-500/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-rose-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                India&apos;s First IT-Professional Matrimony Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Find Your{" "}
              <span className="text-gradient">Perfect Match</span>
              <br />
              in Tech
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Where IT professionals find meaningful connections. Our AI-powered
              platform matches you based on tech stack compatibility, career
              aspirations, and shared values.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="xl" className="gap-2 text-base px-8 shadow-lg shadow-primary/25">
                  Find Matches
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl" className="text-base px-8">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-500" />
                Verified Profiles
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-green-500" />
                Privacy First
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-green-500" />
                Smart Matching
              </span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </motion.div>
      </motion.section>

      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for IT Professionals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every feature is designed to help you find meaningful connections
              within the tech community.
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={Cpu}
              title="Smart Matching"
              description="AI-powered compatibility scoring based on tech stack, experience level, and career goals."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={Code2}
              title="IT-Specific Profiles"
              description="Showcase your tech stack, GitHub, projects, and open source contributions."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={Shield}
              title="Verified Members"
              description="Every profile is verified through work email and LinkedIn to ensure authenticity."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={Lock}
              title="Privacy First"
              description="Granular privacy controls. Share what you want, when you want, with who you want."
              gradient="bg-gradient-to-br from-rose-500 to-orange-500"
            />
            <FeatureCard
              icon={Video}
              title="Video Introductions"
              description="Record a short intro video to make your profile stand out and connect better."
              gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
            />
            <FeatureCard
              icon={Globe}
              title="Tech Community"
              description="Join a community of like-minded IT professionals across 50+ countries."
              gradient="bg-gradient-to-br from-indigo-500 to-violet-500"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Our Impact
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Growing Tech Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Numbers that reflect trust and success in the IT matrimony space.
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            <StatCounter end={10000} label="Active Members" suffix="+" duration={2.5} />
            <StatCounter end={5000} label="Successful Matches" suffix="+" duration={2.5} />
            <StatCounter end={500} label="IT Companies Represented" suffix="+" duration={2.5} />
            <StatCounter end={50} label="Countries" suffix="+" duration={2} />
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Journey to Finding The One
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Four simple steps to find your perfect tech match.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4">
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Tech Ecosystem
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Community Speaks
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From startups to FAANG, our members come from the most innovative companies.
            </p>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="flex gap-8 animate-scroll">
              {[...techStackLogos, ...techStackLogos].map((tech, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl ${tech.bg} border border-border/50`}
                >
                  <span className={`font-bold text-sm ${tech.color}`}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Real couples who found their perfect match through our platform.
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-border/50 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-lg md:text-xl leading-relaxed mb-6 italic text-muted-foreground">
                    &ldquo;{testimonials[testimonialIndex]?.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonials[testimonialIndex]?.rating ?? 5 }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage
                        src={testimonials[testimonialIndex]?.avatar ?? ""}
                        alt={testimonials[testimonialIndex]?.name ?? ""}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(testimonials[testimonialIndex]?.name ?? "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {testimonials[testimonialIndex]?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[testimonialIndex]?.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() =>
                  setTestimonialIndex((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === testimonialIndex
                        ? "bg-primary w-6"
                        : "bg-primary/30 hover:bg-primary/50"
                    }`}
                    onClick={() => setTestimonialIndex(i)}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() =>
                  setTestimonialIndex((prev) =>
                    prev === testimonials.length - 1 ? 0 : prev + 1
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Start free and upgrade as you find your journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full border-2 ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/10"
                      : "border-border/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="px-4 py-1 text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`text-center ${plan.popular ? "pt-8" : ""}`}>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ₹{plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              plan.popular ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block mt-6">
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-rose-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to Find Your{" "}
              <span className="text-gradient">Tech Soulmate</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of IT professionals who have found meaningful
              relationships through our platform. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" className="gap-2 text-base px-10 shadow-lg shadow-primary/25">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="xl" className="text-base px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Free to join. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      <Separator />
    </div>
  );
}
