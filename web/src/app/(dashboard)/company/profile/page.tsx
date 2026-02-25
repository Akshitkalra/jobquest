"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMyCompany, useUpdateCompany } from "@/hooks/use-api";

interface CompanyFormState {
  name: string;
  description: string;
  industry: string;
  companySize: string;
  website: string;
  headquarters: string;
  foundedYear: number | string;
}

const defaultForm: CompanyFormState = {
  name: "",
  description: "",
  industry: "",
  companySize: "",
  website: "",
  headquarters: "",
  foundedYear: "",
};

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1001-5000", label: "1,001-5,000 employees" },
  { value: "5001+", label: "5,001+ employees" },
];

const industryOptions = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Media",
  "Real Estate",
  "Transportation",
  "Energy",
  "Other",
];

export default function CompanyProfilePage() {
  const { data: company, isLoading } = useMyCompany();
  const updateMutation = useUpdateCompany();

  const [form, setForm] = useState<CompanyFormState>(defaultForm);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (company && !initialized) {
      setForm({
        name: company.name ?? "",
        description: company.description ?? "",
        industry: company.industry ?? "",
        companySize: company.companySize ?? "",
        website: company.website ?? "",
        headquarters: company.headquarters ?? "",
        foundedYear: company.foundedYear ?? "",
      });
      setInitialized(true);
    }
  }, [company, initialized]);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Company name is required.");
      return;
    }

    try {
      const payload = {
        ...form,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      };
      await updateMutation.mutateAsync(payload);
      toast.success("Company profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Profile</h2>
          <p className="text-muted-foreground">
            Manage your company information visible to candidates.
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

      {/* Company preview card */}
      {company && (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={company.logoUrl ?? undefined} />
              <AvatarFallback>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{company.name}</h3>
              <p className="text-sm text-muted-foreground">
                {company.industry ?? "Industry not set"} &middot;{" "}
                {company.headquarters ?? "Location not set"}
              </p>
              {company.isVerified && (
                <Badge variant="default" className="mt-1">Verified</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>
            Your company name, description, and industry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Acme Corporation"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your company, mission, and culture..."
              className="min-h-[120px]"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={form.industry}
                onValueChange={(value) => updateField("industry", value)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select
                value={form.companySize}
                onValueChange={(value) => updateField("companySize", value)}
              >
                <SelectTrigger id="companySize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location & Details</CardTitle>
          <CardDescription>
            Headquarters, website, and founding year.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                placeholder="e.g. San Francisco, CA"
                value={form.headquarters}
                onChange={(e) => updateField("headquarters", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                placeholder="e.g. 2020"
                min={1800}
                max={new Date().getFullYear()}
                value={form.foundedYear}
                onChange={(e) =>
                  updateField(
                    "foundedYear",
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
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
