"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  X,
  Plus,
  Save,
  Upload,
  FileText,
  Trash2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useMyProfile,
  useUpdateProfile,
  useMyResumes,
  useUploadResume,
  useDeleteResume,
  useSetPrimaryResume,
} from "@/hooks/use-api";

interface ProfileFormState {
  headline: string;
  summary: string;
  experienceYears: number;
  currentTitle: string;
  currentCompany: string;
  location: string;
  preferredWorkMode: string;
  expectedSalaryMin: number | string;
  expectedSalaryMax: number | string;
  salaryCurrency: string;
  isOpenToWork: boolean;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

const defaultProfile: ProfileFormState = {
  headline: "",
  summary: "",
  experienceYears: 0,
  currentTitle: "",
  currentCompany: "",
  location: "",
  preferredWorkMode: "REMOTE",
  expectedSalaryMin: "",
  expectedSalaryMax: "",
  salaryCurrency: "USD",
  isOpenToWork: false,
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

export default function CandidateProfilePage() {
  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: resumes, isLoading: resumesLoading } = useMyResumes();
  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();
  const setPrimaryMutation = useSetPrimaryResume();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileFormState>(defaultProfile);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form when profile data arrives
  useEffect(() => {
    if (profileData && !initialized) {
      setProfile({
        headline: profileData.headline ?? "",
        summary: profileData.summary ?? "",
        experienceYears: profileData.experienceYears ?? 0,
        currentTitle: profileData.currentTitle ?? "",
        currentCompany: profileData.currentCompany ?? "",
        location: profileData.location ?? "",
        preferredWorkMode: profileData.preferredWorkMode ?? "REMOTE",
        expectedSalaryMin: profileData.expectedSalaryMin ?? "",
        expectedSalaryMax: profileData.expectedSalaryMax ?? "",
        salaryCurrency: profileData.salaryCurrency ?? "USD",
        isOpenToWork: profileData.isOpenToWork ?? false,
        linkedinUrl: profileData.linkedinUrl ?? "",
        githubUrl: profileData.githubUrl ?? "",
        portfolioUrl: profileData.portfolioUrl ?? "",
      });
      setSkills(profileData.skills?.map((s) => s.name) ?? []);
      setInitialized(true);
    }
  }, [profileData, initialized]);

  const updateField = (field: string, value: string | number | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...profile,
        expectedSalaryMin: profile.expectedSalaryMin ? Number(profile.expectedSalaryMin) : null,
        expectedSalaryMax: profile.expectedSalaryMax ? Number(profile.expectedSalaryMax) : null,
        skills,
      };
      await updateProfileMutation.mutateAsync(payload);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    try {
      await uploadResumeMutation.mutateAsync(file);
      toast.success("Resume uploaded successfully!");
    } catch {
      toast.error("Failed to upload resume. Please try again.");
    }

    // Clear the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await deleteResumeMutation.mutateAsync(resumeId);
      toast.success("Resume deleted successfully.");
    } catch {
      toast.error("Failed to delete resume. Please try again.");
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      await setPrimaryMutation.mutateAsync(resumeId);
      toast.success("Primary resume updated.");
    } catch {
      toast.error("Failed to set primary resume. Please try again.");
    }
  };

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (profileLoading || resumesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSaving = updateProfileMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
          <p className="text-muted-foreground">
            Keep your profile up to date to get the best job recommendations.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Info</CardTitle>
          <CardDescription>
            Your professional headline and summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="e.g. Senior Frontend Developer"
              value={profile.headline}
              onChange={(e) => updateField("headline", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Write a brief summary about your experience and what you're looking for..."
              className="min-h-[120px]"
              value={profile.summary}
              onChange={(e) => updateField("summary", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experience</CardTitle>
          <CardDescription>
            Your current role and experience level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                value={profile.experienceYears}
                onChange={(e) =>
                  updateField("experienceYears", parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Title</Label>
              <Input
                id="currentTitle"
                placeholder="e.g. Software Engineer"
                value={profile.currentTitle}
                onChange={(e) => updateField("currentTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                placeholder="e.g. Google"
                value={profile.currentCompany}
                onChange={(e) =>
                  updateField("currentCompany", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
          <CardDescription>
            Your location and work preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Preferred Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workMode">Preferred Work Mode</Label>
              <Select
                value={profile.preferredWorkMode}
                onValueChange={(value) =>
                  updateField("preferredWorkMode", value)
                }
              >
                <SelectTrigger id="workMode">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Expected Salary Min</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="e.g. 100000"
                value={profile.expectedSalaryMin}
                onChange={(e) =>
                  updateField(
                    "expectedSalaryMin",
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Expected Salary Max</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="e.g. 150000"
                value={profile.expectedSalaryMax}
                onChange={(e) =>
                  updateField(
                    "expectedSalaryMax",
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={profile.salaryCurrency}
                onValueChange={(value) =>
                  updateField("salaryCurrency", value)
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="openToWork"
              checked={profile.isOpenToWork}
              onChange={(e) => updateField("isOpenToWork", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="openToWork" className="cursor-pointer">
              Open to Work
            </Label>
            <span className="text-sm text-muted-foreground">
              - Let recruiters know you&apos;re actively looking
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links</CardTitle>
          <CardDescription>
            Add links to your professional profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={profile.linkedinUrl}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/yourusername"
              value={profile.githubUrl}
              onChange={(e) => updateField("githubUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              value={profile.portfolioUrl}
              onChange={(e) => updateField("portfolioUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
          <CardDescription>
            Add your technical and professional skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1 text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {skill}</span>
                </button>
              </Badge>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No skills added yet.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              disabled={!skillInput.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumes</CardTitle>
          <CardDescription>
            Upload your resume in PDF format. You can have multiple resumes and set one as primary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing resumes */}
          {resumes && resumes.length > 0 ? (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {resume.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(resume.fileSize)} &middot; Uploaded{" "}
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {resume.isPrimary && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!resume.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(resume.id)}
                        disabled={setPrimaryMutation.isPending}
                      >
                        {setPrimaryMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Star className="h-3 w-3 mr-1" />
                        )}
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResume(resume.id)}
                      disabled={deleteResumeMutation.isPending}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      {deleteResumeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No resumes uploaded yet.
            </div>
          )}

          {/* Upload input */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadResumeMutation.isPending}
            >
              {uploadResumeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploadResumeMutation.isPending ? "Uploading..." : "Upload Resume (PDF)"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Maximum file size: 10MB
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save button (bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
