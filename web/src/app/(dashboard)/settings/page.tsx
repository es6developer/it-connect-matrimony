"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import toast from "react-hot-toast";


interface NotificationSetting {
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [notifications, setNotifications] = useState<Record<string, NotificationSetting>>({
    interestReceived: { label: "Interest Received", description: "When someone sends you an interest", enabled: true },
    interestAccepted: { label: "Interest Accepted", description: "When your interest is accepted", enabled: true },
    newMessage: { label: "New Message", description: "When you receive a new message", enabled: true },
    dailyMatch: { label: "Daily Matches", description: "Daily match recommendations", enabled: true },
    profileView: { label: "Profile Views", description: "When someone views your profile", enabled: false },
    subscription: { label: "Subscription Updates", description: "Payment and subscription alerts", enabled: true },
    marketing: { label: "Marketing", description: "Promotions and offers", enabled: false },
  });

  const [privacySettings, setPrivacySettings] = useState({
    hideProfile: false,
    hidePhotos: false,
    privateMode: false,
    hideOnlineStatus: false,
  });

  const blockedUsers: { id: string; name: string }[] = [];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/api/v1/users/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // error already toasted by interceptor
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await api.delete("/api/v1/users/me");
      toast.success("Account deleted");
      router.push("/auth/login");
    } catch {
      // error already toasted
    } finally {
      setDeleting(false);
    }
  };

  const toggleNotification = async (key: string) => {
    if (!notifications[key]) return;
    const newEnabled = !notifications[key].enabled;
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key]!, enabled: newEnabled },
    }));
    try {
      await api.put("/api/v1/notifications/settings", {
        [key]: newEnabled,
      });
    } catch {
      setNotifications((prev) => ({
        ...prev,
        [key]: { ...prev[key]!, enabled: !newEnabled },
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </motion.div>

      <Tabs defaultValue="account">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" /> Privacy
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" />
                </div>
              </div>
              <Button size="sm" onClick={() => { if (email) { api.put('/api/v1/users/me', { email }).then(() => toast.success('Email updated')).catch(() => toast.error('Failed to update email')); } else { toast.error('Please enter an email'); } }}>Update Email</Button>
              <Button size="sm" className="ml-2" onClick={() => { if (phone) { api.put('/api/v1/users/me', { phone }).then(() => toast.success('Phone updated')).catch(() => toast.error('Failed to update phone')); } else { toast.error('Please enter a phone number'); } }}>Update Phone</Button>
              <Separator />
              <div>
                <Label>Change Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current password"
                    className="mb-2"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className="mb-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Two-factor authentication adds extra security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {twoFAEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <Switch checked={twoFAEnabled} onCheckedChange={(v) => { setTwoFAEnabled(v); api.put('/api/v1/users/me/settings', { twoFactorEnabled: v }).catch(() => { setTwoFAEnabled(!v); toast.error('Failed to update setting'); }); }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Once you delete your account, there is no going back.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="danger" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label>
                      Type <strong>DELETE</strong> to confirm
                    </Label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE"
                      className="mt-1"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirm !== "DELETE" || deleting}
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting..." : "Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {Object.entries(notifications).map(([key, setting], i) => (
                <div key={key}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleNotification(key)}
                    />
                  </div>
                  {i < Object.keys(notifications).length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <CardDescription>Control your visibility on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                { key: "hideProfile", label: "Hide Profile", desc: "Make your profile invisible to others" },
                { key: "hidePhotos", label: "Hide Photos", desc: "Only show photos to accepted interests" },
                { key: "privateMode", label: "Private Mode", desc: "Enhanced privacy with limited visibility" },
                { key: "hideOnlineStatus", label: "Hide Online Status", desc: "Others won't see when you're online" },
              ].map((item, i) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(privacySettings as any)[item.key]}
                      onCheckedChange={(v) => {
                        setPrivacySettings((prev) => ({ ...prev, [item.key]: v }));
                        api.put('/api/v1/users/me/settings', { [item.key]: v }).catch(() => toast.error('Failed to update setting'));
                      }}
                    />
                  </div>
                  {i < 3 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blocked Users</CardTitle>
              <CardDescription>Users you have blocked</CardDescription>
            </CardHeader>
            <CardContent>
              {blockedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No blocked users</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <span className="text-sm">{user.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => toast.success(`Unblock ${user.name} feature coming soon`)}>Unblock</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Preferences</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => { setTheme(option.value as any); api.put('/api/v1/users/me/settings', { theme: option.value }).catch(() => toast.error('Failed to update theme')); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
