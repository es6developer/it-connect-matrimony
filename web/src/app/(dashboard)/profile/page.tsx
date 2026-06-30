"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  Briefcase,
  Pencil,
  Save,
  X,
  Upload,
  Shield,
  Code2,
  GraduationCap,
  Heart,
  Users,
  Sliders,
  Sparkles,
  Plus,
  Loader2,
  Trash2,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileCompletion } from "@/components/profile/profile-completion";
import { getInitials } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FILE_UPLOAD } from "@/constants";

interface ProfileViewData {
  name: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  community: string;
  motherTongue: string;
  experience: number;
  salary: string;
  currency: string;
  workMode: string;
  techStack: string[];
  skills: string[];
  highestEducation: string;
  college: string;
  graduationYear: number;
  family: {
    fatherName: string;
    motherName: string;
    siblings: number;
    familyType: string;
    familyValues: string;
  };
  hobbies: string[];
  languages: string[];
  diet: string;
  drinking: string;
  smoking: string;
  height: number;
}

interface PhotoItem {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface CompletionData {
  percentage: number;
  sections: { key: string; label: string; completed: boolean }[];
}

function mapProfileToView(data: any): ProfileViewData {
  const user = data.user || {};
  const profile = data.profile || {};
  const professional = data.professionalDetail || {};
  const education = data.educationDetails?.[0] || {};
  const family = data.familyDetail || {};
  const lifestyle = data.lifestyleDetail || {};
  return {
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
    email: user.email || "",
    phone: user.phone || "",
    designation: professional.jobTitle || "",
    company: professional.companyName || "",
    location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
    bio: profile.about || "",
    dateOfBirth: profile.dateOfBirth || "",
    gender: profile.gender || "",
    maritalStatus: profile.maritalStatus || "",
    religion: profile.religion || "",
    community: profile.caste || "",
    motherTongue: profile.motherTongue || "",
    experience: professional.experienceYears ?? 0,
    salary: professional.salary ? String(professional.salary) : "",
    currency: professional.currency || "INR",
    workMode: professional.workMode || "",
    techStack: professional.techStack || [],
    skills: professional.skills || [],
    highestEducation: education.degree || "",
    college: education.institution || "",
    graduationYear: education.year ?? 0,
    family: {
      fatherName: family.fatherName || "",
      motherName: family.motherName || "",
      siblings: family.siblings ?? 0,
      familyType: family.familyType || "",
      familyValues: family.familyValues || "",
    },
    hobbies: profile.hobbies || [],
    languages: data.languages || [],
    diet: lifestyle.diet || "",
    drinking: lifestyle.drinking || "",
    smoking: lifestyle.smoking || "",
    height: profile.height ?? 0,
  };
}

const defaultProfile: ProfileViewData = {
  name: "User",
  email: "",
  phone: "",
  designation: "",
  company: "",
  location: "",
  bio: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  religion: "",
  community: "",
  motherTongue: "",
  experience: 0,
  salary: "",
  currency: "INR",
  workMode: "",
  techStack: [],
  skills: [],
  highestEducation: "",
  college: "",
  graduationYear: 0,
  family: { fatherName: "", motherName: "", siblings: 0, familyType: "", familyValues: "" },
  hobbies: [],
  languages: [],
  diet: "",
  drinking: "",
  smoking: "",
  height: 0,
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileViewData>(defaultProfile);
  const [editData, setEditData] = useState<ProfileViewData>(defaultProfile);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [completion, setCompletion] = useState<CompletionData>({
    percentage: 0,
    sections: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    hideProfile: false,
    hidePhotos: false,
    privateMode: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setError(null);
      const [profileRes, completionRes] = await Promise.all([
        api.get("/api/v1/profiles/me"),
        api.get("/api/v1/profiles/me/completion").catch(() => null),
      ]);

      const profileData = profileRes.data?.data || profileRes.data;
      const mapped = mapProfileToView(profileData);
      setProfileData(mapped);
      setEditData(mapped);
      setPhotos(profileData.photos || []);

      if (completionRes?.data?.data) {
        setCompletion(completionRes.data.data);
      } else if (completionRes?.data) {
        setCompletion(completionRes.data);
      }
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];

      promises.push(
        api.put("/api/v1/profiles/me/basic", {
          dateOfBirth: editData.dateOfBirth,
          gender: editData.gender,
          maritalStatus: editData.maritalStatus,
          religion: editData.religion,
          caste: editData.community,
          motherTongue: editData.motherTongue,
          about: editData.bio,
        })
      );

      promises.push(
        api.put("/api/v1/profiles/me/professional", {
          companyName: editData.company,
          jobTitle: editData.designation,
          experienceYears: Number(editData.experience),
          salary: editData.salary,
          currency: editData.currency,
          workMode: editData.workMode,
          techStack: editData.techStack,
          skills: editData.skills,
        })
      );

      promises.push(
        api.put("/api/v1/profiles/me/education", {
          educationDetails: [
            {
              degree: editData.highestEducation,
              institution: editData.college,
              year: Number(editData.graduationYear),
            },
          ],
        })
      );

      promises.push(
        api.put("/api/v1/profiles/me/family", {
          fatherName: editData.family.fatherName,
          motherName: editData.family.motherName,
          siblings: Number(editData.family.siblings),
          familyType: editData.family.familyType,
          familyValues: editData.family.familyValues,
        })
      );

      promises.push(
        api.put("/api/v1/profiles/me/lifestyle", {
          diet: editData.diet,
          smoking: editData.smoking,
          drinking: editData.drinking,
        })
      );

      if (editData.languages.length > 0) {
        promises.push(
          api.put("/api/v1/profiles/me/languages", {
            languages: editData.languages,
          })
        );
      }

      await Promise.all(promises);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      await fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(FILE_UPLOAD.ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP, HEIC)");
      return;
    }

    if (file.size > FILE_UPLOAD.MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${FILE_UPLOAD.MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/api/v1/profiles/me/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newPhoto = res.data?.data || res.data;
      setPhotos((prev) => [...prev, newPhoto]);
      toast.success("Photo uploaded successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api.delete(`/api/v1/profiles/me/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  const handleSetPrimaryPhoto = async (photoId: string) => {
    try {
      await api.put(`/api/v1/profiles/me/photos/${photoId}/primary`);
      setPhotos((prev) =>
        prev.map((p) => ({ ...p, isPrimary: p.id === photoId }))
      );
      toast.success("Primary photo updated");
    } catch {
      toast.error("Failed to set primary photo");
    }
  };

  const updateEditField = (field: keyof ProfileViewData, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const EditableField = ({
    label,
    value,
    field,
    type = "text",
  }: {
    label: string;
    value: string;
    field: keyof ProfileViewData;
    type?: string;
  }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      {isEditing ? (
        <Input
          type={type}
          value={(editData[field] as string) ?? ""}
          onChange={(e) => updateEditField(field, e.target.value)}
          className="mt-1"
        />
      ) : (
        <p className="text-sm font-medium mt-0.5">{value || "Not specified"}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchProfile} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const completionSections =
    completion.sections.length > 0
      ? completion.sections
      : [
          { key: "basic", label: "Basic Details", completed: !!profileData.dateOfBirth },
          { key: "professional", label: "Professional", completed: !!profileData.company },
          { key: "education", label: "Education & Family", completed: !!profileData.highestEducation },
          { key: "lifestyle", label: "Lifestyle & Preferences", completed: !!profileData.diet },
          { key: "photos", label: "Photos & Videos", completed: photos.length > 0 },
        ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage
                src={photos.find((p) => p.isPrimary)?.url || ""}
                alt={profileData.name}
              />
              <AvatarFallback className="text-2xl">{getInitials(profileData.name)}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                {profileData.designation && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {profileData.designation}
                    {profileData.company && ` at ${profileData.company}`}
                  </p>
                )}
                {profileData.location && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-0.5 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {profileData.location}
                  </p>
                )}
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                className="gap-2 shrink-0"
                disabled={isSaving}
                onClick={isEditing ? handleSave : toggleEdit}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  <><Save className="h-4 w-4" /> Save</>
                ) : (
                  <><Pencil className="h-4 w-4" /> Edit Profile</>
                )}
              </Button>
            </div>
            {isEditing && (
              <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={cancelEdit} disabled={isSaving}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto">
              <TabsTrigger value="basic" className="gap-1.5"><Users className="h-4 w-4" /> Basic</TabsTrigger>
              <TabsTrigger value="professional" className="gap-1.5"><Briefcase className="h-4 w-4" /> Professional</TabsTrigger>
              <TabsTrigger value="education" className="gap-1.5"><GraduationCap className="h-4 w-4" /> Education</TabsTrigger>
              <TabsTrigger value="family" className="gap-1.5"><Heart className="h-4 w-4" /> Family</TabsTrigger>
              <TabsTrigger value="lifestyle" className="gap-1.5"><Sparkles className="h-4 w-4" /> Lifestyle</TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5"><Sliders className="h-4 w-4" /> Preferences</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TabsContent value="basic" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EditableField label="Date of Birth" value={profileData.dateOfBirth} field="dateOfBirth" type="date" />
                      <div>
                        <label className="text-xs text-muted-foreground">Gender</label>
                        <p className="text-sm font-medium mt-0.5 capitalize">
                          {profileData.gender ? profileData.gender.replace("_", " ") : "Not specified"}
                        </p>
                      </div>
                      <EditableField label="Marital Status" value={profileData.maritalStatus.replace("_", " ")} field="maritalStatus" />
                      <EditableField label="Religion" value={profileData.religion} field="religion" />
                      <EditableField label="Community" value={profileData.community} field="community" />
                      <EditableField label="Mother Tongue" value={profileData.motherTongue} field="motherTongue" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <p className="text-sm font-medium mt-0.5">{profileData.email || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Phone</label>
                        <p className="text-sm font-medium mt-0.5">{profileData.phone || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => updateEditField("bio", e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm">{profileData.bio || "Not specified"}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="professional" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EditableField label="Company" value={profileData.company} field="company" />
                      <EditableField label="Designation" value={profileData.designation} field="designation" />
                      <div>
                        <label className="text-xs text-muted-foreground">Experience</label>
                        <p className="text-sm font-medium mt-0.5">
                          {profileData.experience ? `${profileData.experience} years` : "Not specified"}
                        </p>
                      </div>
                      <EditableField label="Annual Salary" value={profileData.salary ? `₹${profileData.salary}` : ""} field="salary" />
                      <div>
                        <label className="text-xs text-muted-foreground">Work Mode</label>
                        <p className="text-sm font-medium mt-0.5 capitalize">{profileData.workMode || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-primary" />
                        Tech Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          {editData.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="gap-1">
                              {tech}
                              <button onClick={() =>
                                setEditData((prev) => ({
                                  ...prev,
                                  techStack: prev.techStack.filter((t) => t !== tech),
                                }))
                              }>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast.success('Add tech stack feature coming soon')}>
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.techStack.length > 0 ? (
                            profileData.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/5 text-primary text-xs px-2 py-1 font-medium"
                              >
                                <Code2 className="h-3 w-3" />
                                {tech}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Not specified</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.length > 0 ? (
                          profileData.skills.map((skill) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Education</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EditableField label="Highest Education" value={profileData.highestEducation} field="highestEducation" />
                      <EditableField label="College" value={profileData.college} field="college" />
                      <EditableField label="Graduation Year" value={profileData.graduationYear ? String(profileData.graduationYear) : ""} field="graduationYear" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="family" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Family Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isEditing ? (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground">Father's Name</label>
                            <Input
                              value={editData.family.fatherName}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  family: { ...prev.family, fatherName: e.target.value },
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Mother's Name</label>
                            <Input
                              value={editData.family.motherName}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  family: { ...prev.family, motherName: e.target.value },
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Siblings</label>
                            <Input
                              type="number"
                              value={editData.family.siblings}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  family: { ...prev.family, siblings: Number(e.target.value) },
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Family Type</label>
                            <Input
                              value={editData.family.familyType}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  family: { ...prev.family, familyType: e.target.value },
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Family Values</label>
                            <Input
                              value={editData.family.familyValues}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  family: { ...prev.family, familyValues: e.target.value },
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground">Father's Name</label>
                            <p className="text-sm font-medium mt-0.5">{profileData.family.fatherName || "Not specified"}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Mother's Name</label>
                            <p className="text-sm font-medium mt-0.5">{profileData.family.motherName || "Not specified"}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Siblings</label>
                            <p className="text-sm font-medium mt-0.5">{profileData.family.siblings || "Not specified"}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Family Type</label>
                            <p className="text-sm font-medium mt-0.5 capitalize">{profileData.family.familyType || "Not specified"}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Family Values</label>
                            <p className="text-sm font-medium mt-0.5 capitalize">{profileData.family.familyValues || "Not specified"}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lifestyle" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Lifestyle</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Diet Preference</label>
                        <p className="text-sm font-medium mt-0.5 capitalize">{profileData.diet || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Drinking</label>
                        <p className="text-sm font-medium mt-0.5 capitalize">{profileData.drinking || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Smoking</label>
                        <p className="text-sm font-medium mt-0.5 capitalize">{profileData.smoking || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Height</label>
                        <p className="text-sm font-medium mt-0.5">
                          {profileData.height ? `${profileData.height} cm` : "Not specified"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Hobbies & Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.hobbies.length > 0 ? (
                          profileData.hobbies.map((hobby) => (
                            <Badge key={hobby} variant="secondary">{hobby}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.length > 0 ? (
                          profileData.languages.map((lang) => (
                            <Badge key={lang} variant="outline">{lang}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Match Preferences</CardTitle>
                      <CardDescription>Define what you&apos;re looking for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Set your preferences for age range, location, education, and more to get better matches.
                      </p>
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => toast.success('Preferences configuration coming soon')}>
                        <Sliders className="h-4 w-4" />
                        Configure Preferences
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <ProfileCompletion percentage={completion.percentage} sections={completionSections} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {photo.url ? (
                      <img src={photo.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground/40" />
                    )}
                    {photo.isPrimary && (
                      <Badge variant="default" className="absolute top-1 left-1 text-[8px] h-4 px-1">
                        Primary
                      </Badge>
                    )}
                    {isEditing && photo.url && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!photo.isPrimary && (
                          <button
                            onClick={() => handleSetPrimaryPhoto(photo.id)}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                            title="Set as primary"
                          >
                            <Star className="h-4 w-4 text-white" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 rounded-full bg-red-500/60 hover:bg-red-500/80 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isEditing && photos.length < FILE_UPLOAD.MAX_PHOTOS && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-muted-foreground/40 animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_UPLOAD.ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                onChange={handlePhotoUpload}
              />
              {isEditing && photos.length < FILE_UPLOAD.MAX_PHOTOS && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-2"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Photos
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hide Profile</p>
                  <p className="text-xs text-muted-foreground">Make your profile invisible</p>
                </div>
                <Switch checked={privacySettings.hideProfile} onCheckedChange={(v) => { setPrivacySettings((prev) => ({ ...prev, hideProfile: v })); api.put('/api/v1/users/me/settings', { hideProfile: v }).catch(() => toast.error('Failed to update setting')); }} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hide Photos</p>
                  <p className="text-xs text-muted-foreground">Only show photos to accepted interests</p>
                </div>
                <Switch checked={privacySettings.hidePhotos} onCheckedChange={(v) => { setPrivacySettings((prev) => ({ ...prev, hidePhotos: v })); api.put('/api/v1/users/me/settings', { hidePhotos: v }).catch(() => toast.error('Failed to update setting')); }} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Private Mode</p>
                  <p className="text-xs text-muted-foreground">Hide your online status</p>
                </div>
                <Switch checked={privacySettings.privateMode} onCheckedChange={(v) => { setPrivacySettings((prev) => ({ ...prev, privateMode: v })); api.put('/api/v1/users/me/settings', { privateMode: v }).catch(() => toast.error('Failed to update setting')); }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
