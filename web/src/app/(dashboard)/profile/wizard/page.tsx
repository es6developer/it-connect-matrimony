"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  SkipForward,
  Check,
  Camera,
  Upload,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  RELIGIOUS_BACKGROUNDS,
  MARITAL_STATUSES,
  FAMILY_TYPES,
  FAMILY_VALUES,
  INDIAN_LANGUAGES,
} from "@/constants";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 5;

const stepLabels = [
  "Basic Details",
  "Professional Details",
  "Education & Family",
  "Lifestyle & Preferences",
  "Photos & Videos",
];

export default function ProfileWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    religion: "",
    community: "",
    motherTongue: "",
    company: "",
    designation: "",
    experience: "",
    salary: "",
    currency: "INR",
    workMode: "",
    techStack: [] as string[],
    skills: [] as string[],
    highestEducation: "",
    college: "",
    graduationYear: "",
    fatherName: "",
    motherName: "",
    siblings: "",
    familyType: "",
    familyValues: "",
    diet: "",
    drinking: "",
    smoking: "",
    height: "",
    hobbies: [] as string[],
    languages: [] as string[],
    bio: "",
  });

  const [photos] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/api/v1/profiles/me").then((res) => {
      const d = res.data;
      if (!d) return;
      setFormData({
        name: d.firstName || "",
        dateOfBirth: d.profile?.dateOfBirth || "",
        gender: d.profile?.gender || "",
        maritalStatus: d.profile?.maritalStatus || "",
        religion: d.profile?.religion || "",
        community: d.profile?.caste || "",
        motherTongue: d.profile?.motherTongue || "",
        company: d.professionalDetail?.currentCompany || "",
        designation: d.professionalDetail?.designation || "",
        experience: d.professionalDetail?.yearsOfExperience ? String(d.professionalDetail.yearsOfExperience) : "",
        salary: d.professionalDetail?.currentSalary ? String(d.professionalDetail.currentSalary) : "",
        currency: d.professionalDetail?.currency || "INR",
        workMode: d.professionalDetail?.workMode || "",
        techStack: d.professionalDetail?.technologyStack || [],
        skills: d.professionalDetail?.skills || [],
        highestEducation: d.educationDetails?.[0]?.degree || "",
        college: d.educationDetails?.[0]?.college || "",
        graduationYear: d.educationDetails?.[0]?.yearOfPassing ? String(d.educationDetails[0].yearOfPassing) : "",
        fatherName: d.familyDetail?.fatherName || "",
        motherName: d.familyDetail?.motherName || "",
        siblings: d.familyDetail?.siblingsCount ? String(d.familyDetail.siblingsCount) : "",
        familyType: d.familyDetail?.familyType || "",
        familyValues: d.familyDetail?.familyValues || "",
        diet: d.lifestyleDetail?.diet || "",
        drinking: d.lifestyleDetail?.drinking || "",
        smoking: d.lifestyleDetail?.smoking || "",
        height: d.profile?.height ? String(d.profile.height) : "",
        hobbies: d.lifestyleDetail?.hobbies || [],
        languages: (d.languages || []).map((l: any) => l.language),
        bio: d.profile?.bio || "",
      });
    }).catch(() => {});
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: string, value: string, inputField: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      updateField(field, [...formData[field], value.trim()]);
    }
    if (inputField === "techInput") setTechInput("");
    else if (inputField === "skillInput") setSkillInput("");
    else if (inputField === "hobbyInput") setHobbyInput("");
  };

  const removeFromArray = (field: string, value: string) => {
    updateField(field, formData[field].filter((v: string) => v !== value));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.put("/api/v1/profiles/me", formData);
      toast.success("Draft saved");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await api.put("/api/v1/profiles/me", formData);
      toast.success("Profile created successfully!");
      router.push("/profile");
    } catch {
      toast.error("Failed to create profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post("/api/v1/profiles/me/photos", fd);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                i + 1 <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-[10px] mt-1 hidden sm:block text-center text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-muted rounded-full mt-2">
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handlePrev} className="gap-2" disabled={isSaving}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={handleSaveDraft} className="gap-1" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
        </Button>
        {currentStep < TOTAL_STEPS && (
          <Button variant="outline" size="sm" onClick={handleSkip} className="gap-1" disabled={isSaving}>
            Skip <SkipForward className="h-3 w-3" />
          </Button>
        )}
        {currentStep === TOTAL_STEPS ? (
          <Button className="gap-2" onClick={handleComplete} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Complete Profile
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2" disabled={isSaving}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight">Create Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Step {currentStep} of {TOTAL_STEPS}: {stepLabels[currentStep - 1]}
        </p>
      </motion.div>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Marital Status</Label>
                    <select value={formData.maritalStatus} onChange={(e) => updateField("maritalStatus", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      {MARITAL_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Religion</Label>
                    <select value={formData.religion} onChange={(e) => updateField("religion", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      {RELIGIOUS_BACKGROUNDS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Community / Caste</Label>
                    <Input
                      placeholder="e.g. Agarwal, Iyer"
                      value={formData.community}
                      onChange={(e) => updateField("community", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mother Tongue</Label>
                    <select value={formData.motherTongue} onChange={(e) => updateField("motherTongue", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      {INDIAN_LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Showcase your career and tech skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Company</Label>
                    <Input
                      placeholder="e.g. Google, Microsoft"
                      value={formData.company}
                      onChange={(e) => updateField("company", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formData.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      value={formData.experience}
                      onChange={(e) => updateField("experience", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Work Mode</Label>
                    <select value={formData.workMode} onChange={(e) => updateField("workMode", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Annual Salary</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2500000"
                      value={formData.salary}
                      onChange={(e) => updateField("salary", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <select value={formData.currency} onChange={(e) => updateField("currency", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Tech Stack</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Add a technology..."
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToArray("techStack", techInput, "techInput");
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => addToArray("techStack", techInput, "techInput")}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.techStack.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button onClick={() => removeFromArray("techStack", tech)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToArray("skills", skillInput, "skillInput");
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => addToArray("skills", skillInput, "skillInput")}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="gap-1">
                        {skill}
                        <button onClick={() => removeFromArray("skills", skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Education & Family */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your educational background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Highest Education</Label>
                    <Input
                      placeholder="e.g. B.Tech in Computer Science"
                      value={formData.highestEducation}
                      onChange={(e) => updateField("highestEducation", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>College / University</Label>
                      <Input
                        placeholder="e.g. IIT Bombay"
                        value={formData.college}
                        onChange={(e) => updateField("college", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 2017"
                        value={formData.graduationYear}
                        onChange={(e) => updateField("graduationYear", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Family Details</CardTitle>
                  <CardDescription>Tell us about your family</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Father's Name</Label>
                      <Input
                        placeholder="Father's name"
                        value={formData.fatherName}
                        onChange={(e) => updateField("fatherName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mother's Name</Label>
                      <Input
                        placeholder="Mother's name"
                        value={formData.motherName}
                        onChange={(e) => updateField("motherName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Number of Siblings</Label>
                      <Input
                        type="number"
                        value={formData.siblings}
                        onChange={(e) => updateField("siblings", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Family Type</Label>
                    <select value={formData.familyType} onChange={(e) => updateField("familyType", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      {FAMILY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    </div>
                    <div>
                      <Label>Family Values</Label>
                    <select value={formData.familyValues} onChange={(e) => updateField("familyValues", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                      <option value="">Select</option>
                      {FAMILY_VALUES.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Lifestyle & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle</CardTitle>
                  <CardDescription>Share your lifestyle preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Diet Preference</Label>
                      <select value={formData.diet} onChange={(e) => updateField("diet", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                        <option value="">Select</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="non_vegetarian">Non-Vegetarian</option>
                        <option value="eggetarian">Eggetarian</option>
                        <option value="vegan">Vegan</option>
                      </select>
                    </div>
                    <div>
                      <Label>Drinking</Label>
                      <select value={formData.drinking} onChange={(e) => updateField("drinking", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                        <option value="">Select</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                        <option value="socially">Socially</option>
                      </select>
                    </div>
                    <div>
                      <Label>Smoking</Label>
                      <select value={formData.smoking} onChange={(e) => updateField("smoking", e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                        <option value="">Select</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                        <option value="occasionally">Occasionally</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 175"
                        value={formData.height}
                        onChange={(e) => updateField("height", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Languages Known</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {INDIAN_LANGUAGES.slice(0, 10).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              if (formData.languages.includes(lang)) {
                                removeFromArray("languages", lang);
                              } else {
                                updateField("languages", [...formData.languages, lang]);
                              }
                            }}
                            className={cn(
                              "text-xs px-2 py-1 rounded-full border transition-colors",
                              formData.languages.includes(lang)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hobbies & Interests</CardTitle>
                  <CardDescription>What do you enjoy doing?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a hobby..."
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToArray("hobbies", hobbyInput, "hobbyInput");
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => addToArray("hobbies", hobbyInput, "hobbyInput")}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.hobbies.map((hobby: string) => (
                      <Badge key={hobby} variant="secondary" className="gap-1">
                        {hobby}
                        <button onClick={() => removeFromArray("hobbies", hobby)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>Write a brief introduction</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Tell potential matches about yourself..."
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Photos & Videos */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos & Videos</CardTitle>
                <CardDescription>Add photos to complete your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-lg bg-muted flex items-center justify-center">
                      {photo ? (
                        <img src={photo} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground/40" />
                      )}
                      {i === 0 && (
                        <Badge className="absolute top-2 left-2 text-[10px]">Primary</Badge>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, i) => (
                    <button
                      key={`empty-${i}`}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 text-muted-foreground/40 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground/40" />
                      )}
                      <span className="text-[10px] text-muted-foreground">{isUploading ? "Uploading..." : "Upload"}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Upload up to 10 photos. The first photo will be your profile picture.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {renderNavigation()}
    </div>
  );
}
