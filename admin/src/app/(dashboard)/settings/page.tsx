"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Save, Settings as SettingsIcon, Globe, Mail, Shield, CreditCard, Bell, Palette, Loader2 } from "lucide-react";

const settingGroups = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "site", label: "Site", icon: Globe },
  { id: "email", label: "Email", icon: Mail },
  { id: "security", label: "Security", icon: Shield },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeGroup, setActiveGroup] = useState("general");
  const [values, setValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settingsData, setSettingsData] = useState<Record<string, { key: string; label: string; value: string; type: string }[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.settings.list();
        const settings: any[] = res.data.data ?? res.data ?? [];
        const grouped: Record<string, any[]> = {};
        const all: Record<string, string> = {};
        settings.forEach((s: any) => {
          const g = s.group ?? "general";
          if (!grouped[g]) grouped[g] = [];
          grouped[g].push({ key: s.key, label: s.label ?? s.key, value: String(s.value ?? ""), type: s.type ?? "string" });
          all[s.key] = String(s.value ?? "");
        });
        // Fill in missing groups from the static data
        const staticData: Record<string, { key: string; label: string; value: string; type: string }[]> = {
          general: [
            { key: "site_name", label: "Site Name", value: "IT Connect Matrimony", type: "string" },
            { key: "site_description", label: "Site Description", value: "Find your perfect match in tech", type: "string" },
            { key: "support_email", label: "Support Email", value: "support@itconnectmatrimony.com", type: "string" },
            { key: "maintenance_mode", label: "Maintenance Mode", value: "false", type: "boolean" },
          ],
          site: [
            { key: "max_profile_photos", label: "Max Profile Photos", value: "10", type: "number" },
            { key: "profile_approval", label: "Profile Approval Required", value: "true", type: "boolean" },
            { key: "allow_guest_browsing", label: "Allow Guest Browsing", value: "false", type: "boolean" },
            { key: "min_age_requirement", label: "Minimum Age", value: "18", type: "number" },
          ],
          email: [
            { key: "smtp_host", label: "SMTP Host", value: "smtp.sendgrid.net", type: "string" },
            { key: "smtp_port", label: "SMTP Port", value: "587", type: "number" },
            { key: "smtp_from", label: "From Address", value: "noreply@itconnectmatrimony.com", type: "string" },
            { key: "email_verification", label: "Require Email Verification", value: "true", type: "boolean" },
          ],
          security: [
            { key: "max_login_attempts", label: "Max Login Attempts", value: "5", type: "number" },
            { key: "lockout_duration", label: "Lockout Duration (min)", value: "30", type: "number" },
            { key: "two_factor_auth", label: "Two-Factor Auth", value: "false", type: "boolean" },
            { key: "session_timeout", label: "Session Timeout (min)", value: "60", type: "number" },
          ],
          payments: [
            { key: "currency", label: "Currency", value: "USD", type: "string" },
            { key: "stripe_key", label: "Stripe Publishable Key", value: "pk_test_********", type: "string" },
            { key: "tax_rate", label: "Tax Rate (%)", value: "8.5", type: "number" },
            { key: "refund_period", label: "Refund Period (days)", value: "14", type: "number" },
          ],
          notifications: [
            { key: "welcome_email", label: "Welcome Email", value: "true", type: "boolean" },
            { key: "match_notification", label: "Match Notifications", value: "true", type: "boolean" },
            { key: "message_notification", label: "Message Notifications", value: "true", type: "boolean" },
            { key: "weekly_digest", label: "Weekly Digest", value: "true", type: "boolean" },
          ],
          appearance: [
            { key: "primary_color", label: "Primary Color", value: "#2563eb", type: "string" },
            { key: "logo_url", label: "Logo URL", value: "/logo.png", type: "string" },
            { key: "favicon_url", label: "Favicon URL", value: "/favicon.ico", type: "string" },
            { key: "custom_css", label: "Custom CSS", value: "", type: "string" },
          ],
        };
        Object.entries(staticData).forEach(([g, items]) => {
          if (!grouped[g]) grouped[g] = items;
          else if (grouped[g]) {
            items.forEach((item) => {
              if (!grouped[g]!.find((s: any) => s.key === item.key)) {
                grouped[g]!.push(item);
              }
            });
          }
        });
        setSettingsData(grouped);
        setValues(all);
        setOriginalValues({ ...all });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const changed: Record<string, string> = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== originalValues[key]) {
          changed[key] = values[key]!;
        }
      });
      if (Object.keys(changed).length === 0) {
        alert("No changes to save.");
        return;
      }
      await Promise.all(
        Object.entries(changed).map(([key, value]) => adminApi.settings.update(key, value))
      );
      setOriginalValues({ ...values });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const currentSettings = settingsData[activeGroup] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage site configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50",
            saved ? "bg-emerald-600" : "bg-primary hover:bg-primary/90"
          )}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Saved!" : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-48 space-y-1">
            {settingGroups.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    activeGroup === group.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {group.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-base font-semibold mb-1 capitalize">{activeGroup} Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure {activeGroup} related settings for the platform.
              </p>
              <div className="space-y-4">
                {currentSettings.map((setting, idx) => (
                  <div key={setting.key || idx} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{setting.label}</label>
                      <p className="text-xs text-muted-foreground">{setting.key}</p>
                    </div>
                    <div className="sm:w-72">
                      {setting.type === "boolean" ? (
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox"
                            checked={values[setting.key] === "true"}
                            onChange={(e) => setValues({ ...values, [setting.key]: e.target.checked ? "true" : "false" })}
                            className="peer sr-only" />
                          <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                        </label>
                      ) : setting.type === "number" ? (
                        <input type="number" value={values[setting.key] ?? ""}
                          onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors" />
                      ) : (
                        <input type="text" value={values[setting.key] ?? ""}
                          onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
