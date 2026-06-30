"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, Crown, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const plans = [
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
    gradient: "from-gray-500 to-gray-600",
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
    gradient: "from-amber-500 to-rose-500",
  },
  {
    name: "Platinum",
    price: "1,999",
    period: "/month",
    description: "For the best experience",
    features: [
      "50 daily matches",
      "Advanced search filters",
      "Send unlimited messages",
      "See who liked you",
      "Incognito mode",
      "Read receipts",
      "Priority support",
      "Premium profile badge",
    ],
    cta: "Go Platinum",
    popular: false,
    gradient: "from-purple-500 to-blue-500",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your journey. Start free and upgrade as you go.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full border-2 ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-4 py-1 text-xs whitespace-nowrap">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? "pt-8" : ""}`}>
                  <div className="flex justify-center mb-4">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}
                    >
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                  </div>
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

                  <Link href="/register">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full mt-4 gap-2"
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Compare Features</h2>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-left font-medium">Feature</div>
              <div className="text-center font-medium">Free</div>
              <div className="text-center font-medium text-primary">Premium</div>
              <div className="text-center font-medium">Platinum</div>

              {[
                ["Daily Matches", "5", "20", "50"],
                ["Advanced Filters", "✗", "✓", "✓"],
                ["Send Messages", "✗", "✓", "✓"],
                ["See Who Liked You", "✗", "✓", "✓"],
                ["Profile Highlight", "✗", "✓", "✓"],
                ["Incognito Mode", "✗", "✗", "✓"],
                ["Read Receipts", "✗", "✗", "✓"],
                ["Priority Support", "✗", "✗", "✓"],
              ].map((row) => (
                <div key={row[0]} className="contents">
                  <div className="py-3 border-b text-left">{row[0]}</div>
                  <div className="py-3 border-b text-center text-muted-foreground">{row[1]}</div>
                  <div className="py-3 border-b text-center text-primary font-medium">{row[2]}</div>
                  <div className="py-3 border-b text-center">{row[3]}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center bg-muted/50 rounded-2xl p-12 max-w-3xl mx-auto"
        >
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Start Your Journey Today</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join thousands of IT professionals who have found meaningful relationships through our platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Smart Matching</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Free to Join</span>
            </div>
          </div>
          <Link href="/register">
            <Button size="lg" className="mt-8 gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
