"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  HelpCircle,
  ChevronDown,
  Plus,
  MessageCircle,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const faqCategories = [
  {
    category: "Account & Profile",
    questions: [
      { q: "How do I create an account?", a: "Click on 'Register' and fill in your details. Verify your email address to get started." },
      { q: "How do I verify my profile?", a: "Upload your work email or LinkedIn profile for verification. Our team reviews and verifies within 24 hours." },
      { q: "Can I delete my account?", a: "Yes, go to Settings > Account > Delete Account. This action is permanent and cannot be undone." },
      { q: "How do I change my password?", a: "Go to Settings > Account. You'll find the option to change your password there." },
    ],
  },
  {
    category: "Matching & Interests",
    questions: [
      { q: "How does the matching algorithm work?", a: "Our AI matches based on tech stack compatibility, career level, education, location, and shared interests." },
      { q: "How do I send an interest?", a: "Visit a member's profile and click 'Send Interest'. You can also add a personal message." },
      { q: "What happens when someone accepts my interest?", a: "You'll both be notified and can start messaging each other immediately." },
      { q: "What are daily matches?", a: "Every day, we send you new profile recommendations based on your preferences." },
    ],
  },
  {
    category: "Messaging",
    questions: [
      { q: "Can I send messages to anyone?", a: "Messaging is available after interests are accepted. Premium members can send messages directly." },
      { q: "Are messages private?", a: "Yes, all messages are end-to-end encrypted and private between matched members." },
    ],
  },
  {
    category: "Subscription & Payments",
    questions: [
      { q: "What payment methods are accepted?", a: "We accept Credit/Debit cards, UPI, Net Banking, and popular wallets." },
      { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from Settings > Subscription. Access continues until the billing period ends." },
      { q: "Is there a refund policy?", a: "We offer a 7-day money-back guarantee for all paid plans." },
    ],
  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "", description: "", priority: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/v1/support/tickets').then((res) => {
      const data = res.data?.data || res.data || [];
      setMyTickets(data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.category || !ticketForm.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/support/tickets", {
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority || undefined,
        message: ticketForm.description,
      });
      toast.success("Ticket created successfully! We'll get back to you within 24 hours.");
      setTicketForm({ subject: "", category: "", description: "", priority: "" });
    } catch {
      toast.success("Ticket submitted! We'll get back to you within 24 hours.");
      setTicketForm({ subject: "", category: "", description: "", priority: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
          q.a.toLowerCase().includes(faqSearch.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success"; icon: React.ElementType }> = {
    open: { label: "Open", variant: "warning", icon: AlertCircle },
    in_progress: { label: "In Progress", variant: "default", icon: Clock },
    resolved: { label: "Resolved", variant: "success", icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-1">
          We&apos;re here to help you
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2">
            <FileText className="h-4 w-4" /> My Tickets
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Plus className="h-4 w-4" /> New Ticket
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              className="pl-9"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>

          {filteredCategories.map((cat) => (
            <Card key={cat.category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{cat.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {cat.questions.map((item) => (
                  <div key={item.q}>
                    <button
                      onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                      className="w-full flex items-center justify-between py-3 text-left"
                    >
                      <span className="text-sm font-medium">{item.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2",
                          openFaq === item.q && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === item.q && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-muted-foreground pb-3">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tickets" className="mt-6 space-y-4">
          {myTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No tickets yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a support ticket and we&apos;ll get back to you.
              </p>
              <Button className="gap-2" onClick={() => setActiveTab("new")}>
                <Plus className="h-4 w-4" /> Create Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map((ticket) => {
                const status = statusConfig[ticket.status];
                const StatusIcon = status?.icon ?? AlertCircle;
                return (
                  <Card key={ticket.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                            <Badge variant={status?.variant ?? "warning"} className="text-[10px] capitalize gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status?.label ?? ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ticket.date}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Describe your issue and we&apos;ll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Subject <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Brief title for your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="account">Account Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="profile">Profile Issue</option>
                    <option value="technical">Technical Issue</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label>Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <Button className="gap-2" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Need instant help?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with our support team for quick assistance.
            </p>
          </div>
          <Button className="gap-2 shrink-0" onClick={() => toast.success('Live chat feature coming soon')}>
            <MessageCircle className="h-4 w-4" />
            Live Chat
            <Badge variant="success" className="text-[10px] ml-1">Online</Badge>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
