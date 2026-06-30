"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Shield,
  Target,
  Code2,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const values = [
  {
    icon: Heart,
    title: "Meaningful Connections",
    description: "We believe in fostering genuine relationships based on shared values and interests.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Every profile is verified to ensure authentic connections in a safe environment.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Code2,
    title: "Tech-Centric Approach",
    description: "Built by IT professionals, for IT professionals, understanding your unique needs.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Smart Matching",
    description: "Our AI algorithms analyze tech stack compatibility for better matches.",
    gradient: "from-purple-500 to-violet-500",
  },
];

const team = [
  { name: "Arun Sharma", role: "CEO & Co-Founder", avatar: "" },
  { name: "Priya Patel", role: "CTO & Co-Founder", avatar: "" },
  { name: "Rahul Verma", role: "Head of Product", avatar: "" },
  { name: "Sanya Kapoor", role: "Head of Engineering", avatar: "" },
];

export default function AboutPage() {
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
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connecting IT Professionals Through{" "}
              <span className="text-gradient">Meaningful Matches</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              IT Connect Matrimony was founded with a simple vision: help IT professionals find
              meaningful relationships with people who truly understand their world.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  IT Connect Matrimony was born from a common observation: IT professionals face
                  unique challenges in finding compatible partners. Long working hours, specific
                  career paths, and the need for someone who understands the tech lifestyle.
                </p>
                <p>
                  Founded by a team of software engineers and matchmaking experts, we built a
                  platform that combines technological innovation with traditional matchmaking
                  values. Our AI-powered compatibility system goes beyond surface-level matching.
                </p>
                <p>
                  Today, we serve over 10,000 active members from 500+ companies across 50+
                  countries, helping IT professionals find their perfect match.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "10,000+", label: "Active Members" },
                { value: "5,000+", label: "Successful Matches" },
                { value: "500+", label: "Companies" },
                { value: "50+", label: "Countries" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted/50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              Our Values
            </Badge>
            <h2 className="text-3xl font-bold mb-4">What We Stand For</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full group hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              Our Team
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Meet the People Behind IT Connect</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-primary/20">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="py-20 text-center bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Quote className="h-10 w-10 text-primary/30 mx-auto" />
            <h2 className="text-3xl font-bold">
              Ready to Find Your{" "}
              <span className="text-gradient">Perfect Tech Match</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join thousands of IT professionals who have found meaningful relationships through
              our platform.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Join Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
