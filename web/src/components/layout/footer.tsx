import Link from "next/link";
import Image from "next/image";
import { Heart, Github, Twitter, Linkedin, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/help/privacy" },
  { label: "Terms of Service", href: "/help/terms" },
  { label: "FAQs", href: "/help/faq" },
];

const RESOURCES = [
  { label: "Career Tips", href: "/blog?category=career" },
  { label: "Tech Events", href: "/blog?category=events" },
  { label: "Interview Prep", href: "/blog?category=interview" },
  { label: "Tech Community", href: "/blog?category=community" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "Email", href: "mailto:hello@itconnectmatrimony.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="IT Connect Matrimony" width={36} height={36} className="rounded-lg" />
              <span className="font-bold text-lg">
                <span className="text-blue-400">IT</span> Connect <span className="text-primary">Matrimony</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where tech professionals find their perfect match. Our AI-powered platform
              connects IT professionals based on tech stack compatibility, career aspirations,
              and shared values.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <Link key={social.label} href={social.href}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{social.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              IT Resources
            </h3>
            <ul className="space-y-3">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Link href="/blog">
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Explore Community
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Trust & Safety
            </h3>
            <p className="text-sm text-muted-foreground">
              All profiles are verified to ensure authentic connections. Your privacy
              and security are our top priorities.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                Verified Profiles
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 text-xs font-medium">
                Secure Matching
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 text-xs font-medium">
                Privacy First
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" /> for
            the tech community
          </p>
        </div>
      </div>
    </footer>
  );
}
